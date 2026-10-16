<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Subscriber;
use App\Services\KhqrService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class KhqrPaymentController extends Controller
{
    protected KhqrService $khqrService;

    public function __construct(KhqrService $khqrService)
    {
        $this->khqrService = $khqrService;
    }

    /**
     * Generate dynamic KHQR Checkout Link with valid SHA1 Security Hash
     */
    public function generate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'customerName' => 'nullable|string',
            'customerEmail' => 'nullable|email',
            'company' => 'nullable|string',
            'items' => 'nullable',
            'remark' => 'nullable|string|max:50',
            'transaction_id' => 'nullable|string',
        ]);

        $amount = (float) $validated['amount'];
        $transactionId = $validated['transaction_id'] ?? ('SYN-KHQR-' . strtoupper(Str::random(6)) . '-' . time());
        $remark = $validated['remark'] ?? ('SYNAPSE_AI_' . substr(preg_replace('/[^A-Za-z0-9]/', '', $transactionId), -8));

        // Generate dynamic payment via service
        $payment = $this->khqrService->createPayment($amount, $transactionId, $remark);

        // Pre-create or record Order in database
        $order = Order::updateOrCreate(
            ['order_number' => $transactionId],
            [
                'customer_name' => $validated['customerName'] ?? 'Valued Customer',
                'customer_email' => $validated['customerEmail'] ?? 'customer@synapse.ai',
                'company' => $validated['company'] ?? '',
                'items' => is_array($validated['items'] ?? null) ? $validated['items'] : [$validated['items'] ?? 'AI Suite License'],
                'amount' => $amount,
                'payment_method' => 'KHQR Direct Gateway',
                'aba_link' => $payment['checkout_url'],
                'status' => 'Pending KHQR Payment',
                'api_key' => 'sk_synapse_live_' . Str::random(28),
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Dynamic KHQR payment request generated successfully',
            'transaction_id' => $transactionId,
            'amount' => $payment['amount'],
            'currency' => 'USD',
            'remark' => $payment['remark'],
            'hash' => $payment['hash'],
            'profile_id' => $payment['profile_id'],
            'checkout_url' => $payment['checkout_url'],
            'iframe_url' => $payment['iframe_url'],
            'order_id' => $order->id,
            'order_number' => $order->order_number,
            'created_at' => $payment['created_at'],
        ]);
    }

    /**
     * Confirm/Verify payment status for a transaction
     */
    public function verify(Request $request, string $transactionId): JsonResponse
    {
        $order = Order::where('order_number', $transactionId)->first();

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Transaction not found',
            ], 404);
        }

        // If client sends confirmation or manual verification
        if ($request->boolean('confirm') || $request->input('confirm') === 'true' || $request->input('confirm') == '1' || $order->status === 'Verified') {
            $order->status = 'Verified';
            $order->save();

            // Auto-enroll subscriber
            if (!empty($order->customer_email)) {
                Subscriber::updateOrCreate(
                    ['email' => $order->customer_email],
                    [
                        'name' => $order->customer_name,
                        'plan' => 'Pro AI Suite (Annual)',
                        'tier' => 'pro',
                        'tokens_used' => 0,
                        'token_limit' => 15000000,
                        'status' => 'Active',
                        'renews_on' => now()->addYear()->format('Y-m-d'),
                        'payment_method' => 'KHQR Direct Gateway',
                    ]
                );
            }
        }

        return response()->json([
            'success' => true,
            'order' => $order,
            'status' => $order->status,
            'is_paid' => $order->status === 'Verified',
            'api_key' => $order->api_key,
        ]);
    }

    /**
     * Get KHQR Gateway status and public configuration
     */
    public function info(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'profile_id' => $this->khqrService->getProfileId(),
            'gateway_url' => $this->khqrService->getGatewayUrl(),
            'supported_methods' => ['KHQR', 'ABA Mobile', 'Bakong', 'Any Cambodian Banking App'],
            'status' => 'Operational',
        ]);
    }
}
