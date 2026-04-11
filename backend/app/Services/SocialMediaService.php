<?php

namespace App\Services;

use App\Models\SocialFeed;
use Illuminate\Support\Facades\Http;

class SocialMediaService
{
    protected $instagramGraphUrl = 'https://graph.instagram.com/v18.0';
    protected $facebookGraphUrl = 'https://graph.facebook.com/v18.0';

    /**
     * Fetch Instagram public posts and comments
     * 
     * @param string $instagramBusinessAccountId
     * @param string $accessToken
     * @return array
     */
    public function fetchInstagramFeed($instagramBusinessAccountId, $accessToken)
    {
        try {
            // Fetch recent media
            $response = Http::get(
                "{$this->instagramGraphUrl}/{$instagramBusinessAccountId}/media",
                [
                    'fields' => 'id,caption,media_type,media_url,permalink,like_count,comments_count,timestamp',
                    'access_token' => $accessToken,
                ]
            );

            if (!$response->successful()) {
                return ['success' => false, 'message' => 'Failed to fetch Instagram feed'];
            }

            $posts = $response->json()['data'] ?? [];
            $savedCount = 0;

            foreach ($posts as $post) {
                // Get comments for each post
                $comments = $this->fetchInstagramComments($post['id'], $accessToken);

                $feed = SocialFeed::updateOrCreate(
                    ['post_id' => $post['id'], 'platform' => 'instagram'],
                    [
                        'platform' => 'instagram',
                        'source_id' => $instagramBusinessAccountId,
                        'content' => $post['caption'] ?? '',
                        'likes' => $post['like_count'] ?? 0,
                        'comments_count' => $post['comments_count'] ?? 0,
                        'comments' => $comments,
                        'metadata' => [
                            'media_type' => $post['media_type'],
                            'media_url' => $post['media_url'] ?? null,
                            'permalink' => $post['permalink'] ?? null,
                        ],
                        'posted_at' => $post['timestamp'] ?? now(),
                        'fetched_at' => now(),
                    ]
                );

                $savedCount++;
            }

            return [
                'success' => true,
                'message' => "Saved {$savedCount} Instagram posts",
                'count' => $savedCount,
            ];
        } catch (\Exception $e) {
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }

    /**
     * Fetch comments from Instagram post
     */
    private function fetchInstagramComments($postId, $accessToken, $limit = 10)
    {
        try {
            $response = Http::get(
                "{$this->instagramGraphUrl}/{$postId}/comments",
                [
                    'fields' => 'id,text,username,like_count,timestamp',
                    'limit' => $limit,
                    'access_token' => $accessToken,
                ]
            );

            return $response->successful() ? ($response->json()['data'] ?? []) : [];
        } catch (\Exception $e) {
            return [];
        }
    }

    /**
     * Fetch Facebook page posts and comments
     */
    public function fetchFacebookFeed($facebookPageId, $accessToken)
    {
        try {
            $response = Http::get(
                "{$this->facebookGraphUrl}/{$facebookPageId}/posts",
                [
                    'fields' => 'id,message,story,full_picture,created_time,likes.summary(total_count).limit(0),comments.summary(total_count).limit(10)',
                    'access_token' => $accessToken,
                ]
            );

            if (!$response->successful()) {
                return ['success' => false, 'message' => 'Failed to fetch Facebook feed'];
            }

            $posts = $response->json()['data'] ?? [];
            $savedCount = 0;

            foreach ($posts as $post) {
                $comments = $this->extractFacebookComments($post);

                $feed = SocialFeed::updateOrCreate(
                    ['post_id' => $post['id'], 'platform' => 'facebook'],
                    [
                        'platform' => 'facebook',
                        'source_id' => $facebookPageId,
                        'content' => $post['message'] ?? $post['story'] ?? '',
                        'likes' => $post['likes']['summary']['total_count'] ?? 0,
                        'comments_count' => $post['comments']['summary']['total_count'] ?? 0,
                        'comments' => $comments,
                        'metadata' => [
                            'full_picture' => $post['full_picture'] ?? null,
                        ],
                        'posted_at' => $post['created_time'] ?? now(),
                        'fetched_at' => now(),
                    ]
                );

                $savedCount++;
            }

            return [
                'success' => true,
                'message' => "Saved {$savedCount} Facebook posts",
                'count' => $savedCount,
            ];
        } catch (\Exception $e) {
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }

    /**
     * Extract comments from Facebook post data
     */
    private function extractFacebookComments($post)
    {
        return isset($post['comments']['data']) 
            ? collect($post['comments']['data'])->map(function ($comment) {
                return [
                    'text' => $comment['message'] ?? '',
                    'username' => $comment['name'] ?? 'Anonymous',
                    'created_at' => $comment['created_time'] ?? null,
                ];
            })->toArray()
            : [];
    }

    /**
     * Sync all configured social media feeds
     */
    public function syncAllFeeds()
    {
        $results = [];

        // Sync Instagram if configured
        $instagramId = \App\Models\Configuration::get('instagram_id');
        $instagramToken = \App\Models\Configuration::get('instagram_token');

        if ($instagramId && $instagramToken) {
            $results['instagram'] = $this->fetchInstagramFeed($instagramId, $instagramToken);
        }

        // Sync Facebook if configured
        $facebookId = \App\Models\Configuration::get('facebook_id');
        $facebookToken = \App\Models\Configuration::get('facebook_token');

        if ($facebookId && $facebookToken) {
            $results['facebook'] = $this->fetchFacebookFeed($facebookId, $facebookToken);
        }

        return $results;
    }
}
