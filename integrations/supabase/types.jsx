/**
 * @typedef {string | number | boolean | null | Object.<string, any> | Array} Json
 */

/**
 * @typedef {Object} ConsumerBlocks
 * @property {string} consumer_id
 * @property {string} created_at
 * @property {string} id
 * @property {string} musician_id
 */

/**
 * @typedef {Object} ConsumerCheckins
 * @property {string} consumer_id
 * @property {string} created_at
 * @property {string} event_date
 * @property {string} event_end_time
 * @property {string} event_start_time
 * @property {string} id
 * @property {string} location
 * @property {string} musician_id
 * @property {number|null} rating
 * @property {number|null} tip_amount
 */

/**
 * @typedef {Object} ConsumerFollows
 * @property {string} consumer_id
 * @property {string} created_at
 * @property {string} id
 * @property {string} musician_id
 */

/**
 * @typedef {Object} ConsumerReviews
 * @property {string|null} checkin_id
 * @property {string} consumer_id
 * @property {string} created_at
 * @property {string} id
 * @property {string} musician_id
 * @property {number} rating
 * @property {string|null} review_text
 */

/**
 * @typedef {Object} ConsumerTips
 * @property {number} amount
 * @property {string|null} checkin_id
 * @property {string} consumer_id
 * @property {string} created_at
 * @property {string} id
 * @property {string} musician_id
 */

/**
 * @typedef {Object} Consumers
 * @property {number|null} age
 * @property {string|null} bio
 * @property {string|null} birthday
 * @property {string} email
 * @property {string|null} first_name
 * @property {string} id
 * @property {string|null} last_name
 * @property {string|null} location
 * @property {string|null} preferred_genre
 * @property {string|null} username
 */

/**
 * @typedef {Object} MusicianEarnings
 * @property {number} amount
 * @property {string} created_at
 * @property {string|null} description
 * @property {string} id
 * @property {string} musician_id
 * @property {string|null} source_id
 * @property {string} source_type
 */

/**
 * @typedef {Object} Musicians
 * @property {number|null} age
 * @property {string|null} artist_name
 * @property {string|null} bio
 * @property {string|null} birthday
 * @property {string|null} email
 * @property {string|null} first_name
 * @property {string|null} genre
 * @property {string} id
 * @property {string|null} last_name
 * @property {string|null} location
 * @property {string|null} username
 */

/**
 * @typedef {Object} Profiles
 * @property {string|null} avatar_url
 * @property {string|null} created_at
 * @property {string} email
 * @property {string} id
 * @property {string|null} updated_at
 */

/**
 * @typedef {Object} Database
 * @property {Object} public
 * @property {Object} public.Tables
 * @property {ConsumerBlocks} public.Tables.consumer_blocks
 * @property {ConsumerCheckins} public.Tables.consumer_checkins
 * @property {ConsumerFollows} public.Tables.consumer_follows
 * @property {ConsumerReviews} public.Tables.consumer_reviews
 * @property {ConsumerTips} public.Tables.consumer_tips
 * @property {Consumers} public.Tables.consumers
 * @property {MusicianEarnings} public.Tables.musician_earnings
 * @property {Musicians} public.Tables.musicians
 * @property {Profiles} public.Tables.profiles
 * @property {Object} public.Views
 * @property {Object} public.Functions
 * @property {Object} public.Enums
 * @property {Object} public.CompositeTypes
 */

/**
 * @typedef {Object} Tables
 * @property {ConsumerBlocks} consumer_blocks
 * @property {ConsumerCheckins} consumer_checkins
 * @property {ConsumerFollows} consumer_follows
 * @property {ConsumerReviews} consumer_reviews
 * @property {ConsumerTips} consumer_tips
 * @property {Consumers} consumers
 * @property {MusicianEarnings} musician_earnings
 * @property {Musicians} musicians
 * @property {Profiles} profiles
 */

/**
 * @typedef {Object} Functions
 * @property {Function} get_musician_balance
 */

/**
 * @typedef {Object} Constants
 * @property {Object} public
 * @property {Object} public.Enums
 */

/**
 * Database constants
 * @type {Constants}
 */
export const Constants = {
  public: {
    Enums: {},
  },
};

/**
 * Helper function to get table data with proper typing
 * @param {string} tableName - Name of the table
 * @returns {Object} Table reference
 */
export function getTable(tableName) {
  return {
    name: tableName,
    // Add any table-specific methods here if needed
  };
}

/**
 * Helper function to create a new record
 * @param {string} tableName - Name of the table
 * @param {Object} data - Data to insert
 * @returns {Object} Insert operation result
 */
export function createRecord(tableName, data) {
  return {
    table: tableName,
    data: data,
    operation: 'insert'
  };
}

/**
 * Helper function to update a record
 * @param {string} tableName - Name of the table
 * @param {Object} data - Data to update
 * @param {Object} where - Where clause
 * @returns {Object} Update operation result
 */
export function updateRecord(tableName, data, where) {
  return {
    table: tableName,
    data: data,
    where: where,
    operation: 'update'
  };
}

/**
 * Helper function to delete a record
 * @param {string} tableName - Name of the table
 * @param {Object} where - Where clause
 * @returns {Object} Delete operation result
 */
export function deleteRecord(tableName, where) {
  return {
    table: tableName,
    where: where,
    operation: 'delete'
  };
}

/**
 * Helper function to query records
 * @param {string} tableName - Name of the table
 * @param {Object} options - Query options
 * @returns {Object} Query operation result
 */
export function queryRecords(tableName, options = {}) {
  return {
    table: tableName,
    options: options,
    operation: 'select'
  };
}

/**
 * Helper function to get consumer data
 * @param {string} consumerId - Consumer ID
 * @returns {Promise<Object>} Consumer data
 */
export async function getConsumer(consumerId) {
  try {
    // This would typically use your Supabase client
    return {
      id: consumerId,
      table: 'consumers',
      operation: 'select'
    };
  } catch (error) {
    console.error('Error getting consumer:', error);
    return null;
  }
}

/**
 * Helper function to get musician data
 * @param {string} musicianId - Musician ID
 * @returns {Promise<Object>} Musician data
 */
export async function getMusician(musicianId) {
  try {
    return {
      id: musicianId,
      table: 'musicians',
      operation: 'select'
    };
  } catch (error) {
    console.error('Error getting musician:', error);
    return null;
  }
}

/**
 * Helper function to create a consumer checkin
 * @param {Object} checkinData - Checkin data
 * @returns {Promise<Object>} Checkin creation result
 */
export async function createConsumerCheckin(checkinData) {
  try {
    return {
      table: 'consumer_checkins',
      data: checkinData,
      operation: 'insert'
    };
  } catch (error) {
    console.error('Error creating checkin:', error);
    return null;
  }
}

/**
 * Helper function to create a consumer review
 * @param {Object} reviewData - Review data
 * @returns {Promise<Object>} Review creation result
 */
export async function createConsumerReview(reviewData) {
  try {
    return {
      table: 'consumer_reviews',
      data: reviewData,
      operation: 'insert'
    };
  } catch (error) {
    console.error('Error creating review:', error);
    return null;
  }
}

/**
 * Helper function to create a consumer tip
 * @param {Object} tipData - Tip data
 * @returns {Promise<Object>} Tip creation result
 */
export async function createConsumerTip(tipData) {
  try {
    return {
      table: 'consumer_tips',
      data: tipData,
      operation: 'insert'
    };
  } catch (error) {
    console.error('Error creating tip:', error);
    return null;
  }
}

/**
 * Helper function to get musician earnings
 * @param {string} musicianId - Musician ID
 * @returns {Promise<Object>} Earnings data
 */
export async function getMusicianEarnings(musicianId) {
  try {
    return {
      table: 'musician_earnings',
      where: { musician_id: musicianId },
      operation: 'select'
    };
  } catch (error) {
    console.error('Error getting earnings:', error);
    return null;
  }
}

/**
 * Helper function to follow a musician
 * @param {string} consumerId - Consumer ID
 * @param {string} musicianId - Musician ID
 * @returns {Promise<Object>} Follow creation result
 */
export async function followMusician(consumerId, musicianId) {
  try {
    return {
      table: 'consumer_follows',
      data: {
        consumer_id: consumerId,
        musician_id: musicianId
      },
      operation: 'insert'
    };
  } catch (error) {
    console.error('Error following musician:', error);
    return null;
  }
}

/**
 * Helper function to block a musician
 * @param {string} consumerId - Consumer ID
 * @param {string} musicianId - Musician ID
 * @returns {Promise<Object>} Block creation result
 */
export async function blockMusician(consumerId, musicianId) {
  try {
    return {
      table: 'consumer_blocks',
      data: {
        consumer_id: consumerId,
        musician_id: musicianId
      },
      operation: 'insert'
    };
  } catch (error) {
    console.error('Error blocking musician:', error);
    return null;
  }
}

/**
 * Helper function to get profile data
 * @param {string} profileId - Profile ID
 * @returns {Promise<Object>} Profile data
 */
export async function getProfile(profileId) {
  try {
    return {
      id: profileId,
      table: 'profiles',
      operation: 'select'
    };
  } catch (error) {
    console.error('Error getting profile:', error);
    return null;
  }
}

/**
 * Helper function to update profile
 * @param {string} profileId - Profile ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Profile update result
 */
export async function updateProfile(profileId, updateData) {
  try {
    return {
      table: 'profiles',
      where: { id: profileId },
      data: updateData,
      operation: 'update'
    };
  } catch (error) {
    console.error('Error updating profile:', error);
    return null;
  }
}

// Export all helper functions
export default {
  getTable,
  createRecord,
  updateRecord,
  deleteRecord,
  queryRecords,
  getConsumer,
  getMusician,
  createConsumerCheckin,
  createConsumerReview,
  createConsumerTip,
  getMusicianEarnings,
  followMusician,
  blockMusician,
  getProfile,
  updateProfile,
  Constants
};
