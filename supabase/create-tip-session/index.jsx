import { supabase } from "../../integrations/supabase/supabaseClient";

/**
 * Tip session service for React Native with Stripe integration
 * This service handles creating tip sessions and managing Stripe checkout
 */

// Stripe configuration - you'll need to set these up
const STRIPE_PUBLISHABLE_KEY = "pk_test_your_stripe_publishable_key_here"; // Replace with your actual key
const STRIPE_SECRET_KEY = "sk_test_your_stripe_secret_key_here"; // This should be stored securely

/**
 * Initialize Stripe (call this in your app initialization)
 * Note: You'll need to install @stripe/stripe-react-native
 */
export const initializeStripe = async () => {
  try {
    // This would typically be done in your app's main component or initialization
    // import { StripeProvider } from '@stripe/stripe-react-native';
    // 
    // <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
    //   {/* Your app content */}
    // </StripeProvider>
    
    console.log("Stripe initialized successfully");
    return true;
  } catch (error) {
    console.error("Failed to initialize Stripe:", error);
    return false;
  }
};

/**
 * Create a tip session and initiate Stripe payment
 * @param {Object} params - Tip session parameters
 * @param {number} params.amount - Tip amount in dollars (1-100)
 * @param {string} params.musicianId - Musician's ID
 * @param {string} params.musicianName - Musician's name
 * @param {string} params.consumerId - Consumer's ID (who's giving the tip)
 * @returns {Promise<Object>} Tip session result with Stripe payment intent
 */
export const createTipSession = async ({ amount, musicianId, musicianName, consumerId }) => {
  try {
    // Validate amount - restricted to $1-$100 range
    if (!amount || amount < 1 || amount > 100) {
      throw new Error("Invalid tip amount. Must be between $1-$100");
    }

    // Validate required parameters
    if (!musicianId || !musicianName || !consumerId) {
      throw new Error("Musician ID, name, and consumer ID are required");
    }

    // Create tip session data
    const tipSessionData = {
      amount: amount,
      musician_id: musicianId,
      musician_name: musicianName,
      consumer_id: consumerId,
      status: 'pending',
      created_at: new Date().toISOString(),
      payment_status: 'pending'
    };

    // Store tip session in Supabase
    const { data: tipSession, error: insertError } = await supabase
      .from('tip_sessions')
      .insert(tipSessionData)
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to create tip session: ${insertError.message}`);
    }

    // Create Stripe payment intent
    const paymentIntent = await createStripePaymentIntent({
      amount: amount,
      musicianName: musicianName,
      tipSessionId: tipSession.id,
      metadata: {
        tipSessionId: tipSession.id,
        musicianId: musicianId,
        musicianName: musicianName,
        consumerId: consumerId
      }
    });

    if (!paymentIntent.success) {
      throw new Error(paymentIntent.error);
    }

    // Update tip session with Stripe payment intent ID
    const { error: updateError } = await supabase
      .from('tip_sessions')
      .update({
        stripe_payment_intent_id: paymentIntent.data.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', tipSession.id);

    if (updateError) {
      console.warn("Failed to update tip session with payment intent ID:", updateError);
    }

    // Return the tip session data with payment intent
    return {
      success: true,
      data: {
        ...tipSession,
        paymentIntent: paymentIntent.data
      },
      message: 'Tip session created successfully with Stripe payment intent'
    };

  } catch (error) {
    console.error("Error creating tip session:", error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to create tip session'
    };
  }
};

/**
 * Create Stripe payment intent for the tip
 * @param {Object} params - Payment intent parameters
 * @param {number} params.amount - Amount in dollars
 * @param {string} params.musicianName - Musician's name
 * @param {string} params.tipSessionId - Tip session ID
 * @param {Object} params.metadata - Additional metadata
 * @returns {Promise<Object>} Payment intent result
 */
const createStripePaymentIntent = async ({ amount, musicianName, tipSessionId, metadata }) => {
  try {
    // In a real app, you would make an API call to your backend to create the payment intent
    // This is because you can't safely use the secret key in the client
    // For now, we'll simulate the structure - you'll need to implement the backend API
    
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount * 100, // Convert to cents
        currency: 'usd',
        description: `Tip for ${musicianName}`,
        metadata: metadata
      })
    });

    if (!response.ok) {
      throw new Error('Failed to create payment intent');
    }

    const paymentIntent = await response.json();
    
    return {
      success: true,
      data: paymentIntent
    };

  } catch (error) {
    console.error("Error creating Stripe payment intent:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Confirm payment and complete tip session
 * @param {string} paymentIntentId - Stripe payment intent ID
 * @param {string} tipSessionId - Tip session ID
 * @returns {Promise<Object>} Payment confirmation result
 */
export const confirmTipPayment = async (paymentIntentId, tipSessionId) => {
  try {
    // Update tip session status to completed
    const { data: updatedSession, error: updateError } = await supabase
      .from('tip_sessions')
      .update({
        status: 'completed',
        payment_status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', tipSessionId)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to update tip session: ${updateError.message}`);
    }

    // Create a record in the consumer_tips table
    const tipData = {
      amount: updatedSession.amount,
      consumer_id: updatedSession.consumer_id,
      musician_id: updatedSession.musician_id,
      checkin_id: null, // Optional: link to a specific checkin
      created_at: new Date().toISOString()
    };

    const { data: tipRecord, error: tipError } = await supabase
      .from('consumer_tips')
      .insert(tipData)
      .select()
      .single();

    if (tipError) {
      console.warn("Failed to create tip record:", tipError);
    }

    // Create musician earnings record
    const earningsData = {
      amount: updatedSession.amount,
      musician_id: updatedSession.musician_id,
      source_type: 'tip',
      source_id: tipRecord?.id || null,
      description: `Tip from ${updatedSession.consumer_id}`,
      created_at: new Date().toISOString()
    };

    const { error: earningsError } = await supabase
      .from('musician_earnings')
      .insert(earningsData);

    if (earningsError) {
      console.warn("Failed to create earnings record:", earningsError);
    }

    return {
      success: true,
      data: {
        tipSession: updatedSession,
        tipRecord: tipRecord,
        paymentIntentId: paymentIntentId
      },
      message: 'Tip payment confirmed successfully'
    };

  } catch (error) {
    console.error("Error confirming tip payment:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Handle payment failure
 * @param {string} tipSessionId - Tip session ID
 * @param {string} errorMessage - Error message from Stripe
 * @returns {Promise<Object>} Failure handling result
 */
export const handlePaymentFailure = async (tipSessionId, errorMessage) => {
  try {
    const { data: updatedSession, error } = await supabase
      .from('tip_sessions')
      .update({
        status: 'failed',
        payment_status: 'failed',
        error_message: errorMessage,
        updated_at: new Date().toISOString()
      })
      .eq('id', tipSessionId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update tip session: ${error.message}`);
    }

    return {
      success: true,
      data: updatedSession,
      message: 'Payment failure recorded'
    };

  } catch (error) {
    console.error("Error handling payment failure:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get tip session by ID
 * @param {string} sessionId - Tip session ID
 * @returns {Promise<Object>} Tip session data
 */
export const getTipSession = async (sessionId) => {
  try {
    const { data: tipSession, error } = await supabase
      .from('tip_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch tip session: ${error.message}`);
    }

    return {
      success: true,
      data: tipSession
    };

  } catch (error) {
    console.error("Error fetching tip session:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Update tip session status
 * @param {string} sessionId - Tip session ID
 * @param {string} status - New status (pending, completed, failed, cancelled)
 * @param {Object} additionalData - Additional data to update
 * @returns {Promise<Object>} Update result
 */
export const updateTipSessionStatus = async (sessionId, status, additionalData = {}) => {
  try {
    const updateData = {
      status: status,
      updated_at: new Date().toISOString(),
      ...additionalData
    };

    const { data: updatedSession, error } = await supabase
      .from('tip_sessions')
      .update(updateData)
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update tip session: ${error.message}`);
    }

    return {
      success: true,
      data: updatedSession
    };

  } catch (error) {
    console.error("Error updating tip session:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get all tip sessions for a musician
 * @param {string} musicianId - Musician's ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Tip sessions data
 */
export const getMusicianTipSessions = async (musicianId, options = {}) => {
  try {
    let query = supabase
      .from('tip_sessions')
      .select('*')
      .eq('musician_id', musicianId);

    // Apply filters
    if (options.status) {
      query = query.eq('status', options.status);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    // Order by creation date (newest first)
    query = query.order('created_at', { ascending: false });

    const { data: tipSessions, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch tip sessions: ${error.message}`);
    }

    return {
      success: true,
      data: tipSessions
    };

  } catch (error) {
    console.error("Error fetching musician tip sessions:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get tip session statistics for a musician
 * @param {string} musicianId - Musician's ID
 * @returns {Promise<Object>} Statistics data
 */
export const getTipSessionStats = async (musicianId) => {
  try {
    // Get total tips received
    const { data: totalTips, error: totalError } = await supabase
      .from('tip_sessions')
      .select('amount')
      .eq('musician_id', musicianId)
      .eq('status', 'completed');

    if (totalError) {
      throw new Error(`Failed to fetch total tips: ${totalError.message}`);
    }

    // Get pending tips
    const { data: pendingTips, error: pendingError } = await supabase
      .from('tip_sessions')
      .select('amount')
      .eq('musician_id', musicianId)
      .eq('status', 'pending');

    if (pendingError) {
      throw new Error(`Failed to fetch pending tips: ${pendingError.message}`);
    }

    // Calculate statistics
    const totalAmount = totalTips.reduce((sum, tip) => sum + tip.amount, 0);
    const pendingAmount = pendingTips.reduce((sum, tip) => sum + tip.amount, 0);
    const totalTipsCount = totalTips.length;
    const pendingTipsCount = pendingTips.length;

    return {
      success: true,
      data: {
        totalAmount,
        pendingAmount,
        totalTipsCount,
        pendingTipsCount,
        totalSessions: totalTipsCount + pendingTipsCount
      }
    };

  } catch (error) {
    console.error("Error fetching tip statistics:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Cancel a tip session
 * @param {string} sessionId - Tip session ID
 * @returns {Promise<Object>} Cancellation result
 */
export const cancelTipSession = async (sessionId) => {
  try {
    const { data: cancelledSession, error } = await supabase
      .from('tip_sessions')
      .update({
        status: 'cancelled',
        payment_status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to cancel tip session: ${error.message}`);
    }

    return {
      success: true,
      data: cancelledSession,
      message: 'Tip session cancelled successfully'
    };

  } catch (error) {
    console.error("Error cancelling tip session:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Process webhook from Stripe (for backend use)
 * @param {Object} webhookData - Webhook data from Stripe
 * @returns {Promise<Object>} Webhook processing result
 */
export const processStripeWebhook = async (webhookData) => {
  try {
    // This function would typically be used in your backend to handle Stripe webhooks
    // It's included here for reference and potential future use
    
    const { type, data } = webhookData;
    
    switch (type) {
      case 'payment_intent.succeeded':
        // Handle successful payment
        const tipSessionId = data.object.metadata.tipSessionId;
        if (tipSessionId) {
          return await confirmTipPayment(data.object.id, tipSessionId);
        }
        break;
        
      case 'payment_intent.payment_failed':
        // Handle failed payment
        const failedTipSessionId = data.object.metadata.tipSessionId;
        if (failedTipSessionId) {
          return await handlePaymentFailure(failedTipSessionId, data.object.last_payment_error?.message || 'Payment failed');
        }
        break;
        
      default:
        console.log(`Unhandled webhook type: ${type}`);
    }

    return {
      success: true,
      message: 'Webhook processed successfully'
    };

  } catch (error) {
    console.error("Error processing Stripe webhook:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Export all functions
export default {
  initializeStripe,
  createTipSession,
  confirmTipPayment,
  handlePaymentFailure,
  getTipSession,
  updateTipSessionStatus,
  getMusicianTipSessions,
  getTipSessionStats,
  cancelTipSession,
  processStripeWebhook
};
