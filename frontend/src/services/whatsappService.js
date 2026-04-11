// WhatsApp Service - Generate pre-filled WhatsApp messages with order details

export const whatsappService = {
  /**
   * Generate WhatsApp message for inquiry
   */
  getInquiryMessage: (productTitle, price) => {
    return `Hi! I'm interested in "${productTitle}" priced at Rs.${price}. Can you provide more details?`;
  },

  /**
   * Generate WhatsApp message for order
   */
  getOrderMessage: (cartItems, total) => {
    const itemsList = cartItems
      .map(item => `• ${item.title} (Qty: ${item.quantity}) - Rs.${(item.price * item.quantity).toFixed(2)}`)
      .join('\n');

    return `Hi! I'd like to place an order:\n\n${itemsList}\n\nTotal: Rs.${total.toFixed(2)}`;
  },

  /**
   * Generate WhatsApp message for custom order
   */
  getCustomOrderMessage: (formData) => {
    return `Hi! I'd like to place a custom order:\n\nType: ${formData.type}\nSize: ${formData.size}\nBudget: Rs.${formData.budget}\n\nDescription:\n${formData.description}`;
  },

  /**
   * Generate WhatsApp message for general inquiry
   */
  getGeneralInquiryMessage: (subject, message) => {
    return `Hi! I have a question:\n\nSubject: ${subject}\n\n${message}`;
  },

  /**
   * Open WhatsApp chat with pre-filled message
   */
  openWhatsApp: (phoneNumber, message) => {
    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappURL, '_blank');
  },

  /**
   * Get WhatsApp phone number from environment or config
   */
  getPhoneNumber: () => {
    return import.meta.env.VITE_WHATSAPP_NUMBER || '923275693892';
  },
};
