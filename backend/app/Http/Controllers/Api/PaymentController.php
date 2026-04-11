<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Order;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function initiateEasypaisa(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
        ]);

        $order = Order::findOrFail($validated['order_id']);

        $merchantId = env('EASYPAISA_MERCHANT_ID');
        $apiKey = env('EASYPAISA_API_KEY');

        if (!$merchantId || !$apiKey) {
            return response()->json(['message' => 'Easypaisa not configured'], 400);
        }

        $transactionId = 'TXN-' . date('YmdHis') . '-' . uniqid();

        $payment = Payment::create([
            'order_id' => $order->id,
            'transaction_id' => $transactionId,
            'gateway' => 'easypaisa',
            'amount' => $order->total,
            'currency' => 'PKR',
            'status' => 'pending',
        ]);

        return response()->json([
            'payment_id' => $payment->id,
            'transaction_id' => $transactionId,
            'amount' => $order->total,
            'merchant_id' => $merchantId,
        ]);
    }

    public function initiateJazzcash(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
        ]);

        $order = Order::findOrFail($validated['order_id']);

        $merchantId = env('JAZZCASH_MERCHANT_ID');
        $password = env('JAZZCASH_PASSWORD'); // Make sure to add this to .env
        $salt = env('JAZZCASH_SALT');         // Make sure to add this to .env
        $returnUrl = "https://sidrabni.com/order-success/" . $order->id;

        if (!$merchantId || !$salt || !$password) {
            return response()->json(['message' => 'JazzCash credentials missing in .env'], 400);
        }

        $dateTime = date('YmdHis');
        $expiryDateTime = date('YmdHis', strtotime('+1 hour'));
        $txnRefNo = 'T' . $dateTime . rand(100, 999);
        $amount = (int)($order->total * 100); // JazzCash expects amount in Paisas (e.g. 100.00 -> 10000)

        $postData = [
            "pp_Version" => "1.1",
            "pp_TxnType" => "MWALLET",
            "pp_Language" => "EN",
            "pp_MerchantID" => $merchantId,
            "pp_SubMerchantID" => "",
            "pp_Password" => $password,
            "pp_BankID" => "TBANK",
            "pp_ProductID" => "RETL",
            "pp_TxnRefNo" => $txnRefNo,
            "pp_Amount" => $amount,
            "pp_TxnCurrency" => "PKR",
            "pp_TxnDateTime" => $dateTime,
            "pp_BillReference" => (string)$order->id,
            "pp_Description" => "Payment for Order #" . $order->id . " - Sidra Brushes N Ink",
            "pp_TxnExpiryDateTime" => $expiryDateTime,
            "pp_ReturnURL" => $returnUrl,
            "ppmpf_1" => "1",
            "ppmpf_2" => "2",
            "ppmpf_3" => "3",
            "ppmpf_4" => "4",
            "ppmpf_5" => "5",
        ];

        // Sort keys alphabetically as required by JazzCash for Hashing
        ksort($postData);

        // Create Hash String
        $hashString = $salt;
        foreach ($postData as $key => $value) {
            if ($value != "") {
                $hashString .= '&' . $value;
            }
        }

        $secureHash = strtoupper(hash_hmac('sha256', $hashString, $salt));
        $postData['pp_SecureHash'] = $secureHash;

        // Save payment record
        Payment::create([
            'order_id' => $order->id,
            'transaction_id' => $txnRefNo,
            'gateway' => 'jazzcash',
            'amount' => $order->total,
            'currency' => 'PKR',
            'status' => 'pending',
        ]);

        return response()->json($postData);
    }

    public function verifyPayment(Request $request)
    {
        $validated = $request->validate([
            'payment_id' => 'required|exists:payments,id',
            'status' => 'required|in:success,failed',
            'gateway_response' => 'nullable|array',
        ]);

        $payment = Payment::findOrFail($validated['payment_id']);
        
        $payment->update([
            'status' => $validated['status'] === 'success' ? 'completed' : 'failed',
            'gateway_response' => $validated['gateway_response'] ?? [],
            'processed_at' => now(),
        ]);

        if ($payment->status === 'completed') {
            $payment->order->update([
                'payment_status' => 'paid',
                'status' => 'processing',
            ]);
        }

        return response()->json($payment);
    }

    public function handleJazzcashCallback(Request $request)
    {
        $response = $request->all();
        \Log::info('JazzCash Callback Received:', $response);

        // PP_ResponseCode 000 means success in JazzCash
        $responseCode = $response['pp_ResponseCode'] ?? null;
        $transactionId = $response['pp_TxnRefNo'] ?? null;
        $orderId = $response['pp_BillReference'] ?? null; // Assuming we send order_id in pp_BillReference

        if (!$orderId) {
            return response()->json(['message' => 'Invalid response'], 400);
        }

        $payment = Payment::where('transaction_id', $transactionId)
                        ->orWhere('order_id', $orderId)
                        ->first();

        if ($payment) {
            $status = ($responseCode === '000') ? 'completed' : 'failed';
            
            $payment->update([
                'status' => $status,
                'gateway_response' => $response,
                'processed_at' => now(),
            ]);

            if ($status === 'completed') {
                $payment->order->update([
                    'payment_status' => 'paid',
                    'status' => 'processing',
                ]);
            }
        }

        // JazzCash expects a 200 OK response to stop retrying the IPN
        return response()->json(['status' => 'received']);
    }

    public function getPaymentStatus($paymentId)
    {
        $payment = Payment::findOrFail($paymentId);
        return response()->json($payment);
    }
}
