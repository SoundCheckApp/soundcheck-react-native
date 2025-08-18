/**
 * @typedef {string | number | boolean | null | Object.<string, any> | Array} Json
 */

/**
 * @typedef {Object} Database
 * @property {Object} public
 * @property {Object} public.Tables
 * @property {Object} public.Tables.consumer_blocks
 * @property {Object} public.Tables.consumer_blocks.Row
 * @property {string} public.Tables.consumer_blocks.Row.consumer_id
 * @property {string} public.Tables.consumer_blocks.Row.created_at
 * @property {string} public.Tables.consumer_blocks.Row.id
 * @property {string} public.Tables.consumer_blocks.Row.musician_id
 * @property {Object} public.Tables.consumer_blocks.Insert
 * @property {string} public.Tables.consumer_blocks.Insert.consumer_id
 * @property {string} [public.Tables.consumer_blocks.Insert.created_at]
 * @property {string} [public.Tables.consumer_blocks.Insert.id]
 * @property {string} public.Tables.consumer_blocks.Insert.musician_id
 * @property {Object} public.Tables.consumer_blocks.Update
 * @property {string} [public.Tables.consumer_blocks.Update.consumer_id]
 * @property {string} [public.Tables.consumer_blocks.Update.created_at]
 * @property {string} [public.Tables.consumer_blocks.Update.id]
 * @property {string} [public.Tables.consumer_blocks.Update.musician_id]
 * @property {Array} public.Tables.consumer_blocks.Relationships
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
 * @typedef {Object} DatabaseSchema
 * @property {Object} Tables
 * @property {Object} Views
 * @property {Object} Functions
 * @property {Object} Enums
 * @property {Object} CompositeTypes
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
