//not implemented phptojs\JsPrinter\JsPrinter::pStmt_Nop
/**
 * @file
 * Secure password hashing functions for user authentication.
 *
 * Based on the Portable PHP password hashing framework.
 * @see http://www.openwall.com/phpass/
 *
 * An alternative or custom version of this password hashing API may be
 * used by setting the variable password_inc to the name of the PHP file
 * containing replacement user_hash_password(), user_check_password(), and
 * user_needs_new_hash() functions.
 */
/**
 * The standard log2 number of iterations for password stretching. This should
 * increase by 1 every Drupal version in order to counteract increases in the
 * speed and power of computers available to crack the hashes.
 */
const DRUPAL_HASH_COUNT=15;
/**
 * The minimum allowed log2 number of iterations for password stretching.
 */
const DRUPAL_MIN_HASH_COUNT=7;
/**
 * The maximum allowed log2 number of iterations for password stretching.
 */
const DRUPAL_MAX_HASH_COUNT=30;
/**
 * The expected (and maximum) number of characters in a hashed password.
 */
const DRUPAL_HASH_LENGTH=55;
/**
 * Returns a string for mapping an int to the corresponding base 64 character.
 */
function _password_itoa64() {
    return "./0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
}
/**
 * Encodes bytes into printable base 64 using the *nix standard from crypt().
 *
 * @param input
 *   The string containing bytes to encode.
 * @param count
 *   The number of characters (bytes) to encode.
 *
 * @return
 *   Encoded string
 */
function _password_base64_encode(input, count) {
    console.log()
    var output;
    output = "";
    var i;
    i = 0;
    var itoa64;
    itoa64 = _password_itoa64();
    __loop1:
        do {
            var value;
            value = ord(input[i++]);
            output += itoa64[value & 63];
            if (i < count) {
                value |= ord(input[i]) << 8;
            }
            output += itoa64[value >> 6 & 63];
            if (i++ >= count) {
                break;
            }
            if (i < count) {
                value |= ord(input[i]) << 16;
            }
            output += itoa64[value >> 12 & 63];
            if (i++ >= count) {
                break;
            }
            output += itoa64[value >> 18 & 63];
        } while (i < count);
    return output;
}
/**
 * Generates a random base 64-encoded salt prefixed with settings for the hash.
 *
 * Proper use of salts may defeat a number of attacks, including:
 *  - The ability to try candidate passwords against multiple hashes at once.
 *  - The ability to use pre-hashed lists of candidate passwords.
 *  - The ability to determine whether two users have the same (or different)
 *    password without actually having to guess one of the passwords.
 *
 * @param count_log2
 *   Integer that determines the number of iterations used in the hashing
 *   process. A larger value is more secure, but takes more time to complete.
 *
 * @return
 *   A 12 character string containing the iteration count and a random salt.
 */

 function _password_generate_salt(count_log2) {
    var output;
    output = "$S$";
    // Ensure that $count_log2 is within set bounds.
    count_log2 = _password_enforce_log2_boundaries(count_log2);
    // We encode the final log2 iteration count in base 64.
    var itoa64;
    itoa64 = _password_itoa64();
    output += itoa64[count_log2];
    // 6 bytes is the standard salt for a portable phpass hash.
    output += _password_base64_encode(drupal_random_bytes(6), 6);
    return output;
}
/**
 * Ensures that $count_log2 is within set bounds.
 *
 * @param count_log2
 *   Integer that determines the number of iterations used in the hashing
 *   process. A larger value is more secure, but takes more time to complete.
 *
 * @return
 *   Integer within set bounds that is closest to $count_log2.
 */
function _password_enforce_log2_boundaries(count_log2) {
    if (count_log2 < DRUPAL_MIN_HASH_COUNT) {
        return DRUPAL_MIN_HASH_COUNT;
    } else if (count_log2 > DRUPAL_MAX_HASH_COUNT) {
        return DRUPAL_MAX_HASH_COUNT;
    }
    return parseInt(count_log2);
}

/**
 * Hash a password using a secure stretched hash.
 *
 * By using a salt and repeated hashing the password is "stretched". Its
 * security is increased because it becomes much more computationally costly
 * for an attacker to try to break the hash by brute-force computation of the
 * hashes of a large number of plain-text words or strings to find a match.
 *
 * @param algo
 *   The string name of a hashing algorithm usable by hash(), like 'sha256'.
 * @param password
 *   Plain-text password up to 512 bytes (128 to 512 UTF-8 characters) to hash.
 * @param setting
 *   An existing hash or the output of _password_generate_salt().  Must be
 *   at least 12 characters (the settings and salt).
 *
 * @return
 *   A string containing the hashed password (and salt) or FALSE on failure.
 *   The return string will be truncated at DRUPAL_HASH_LENGTH characters max.
 */
function _password_crypt(algo, password, setting) {
    // Prevent DoS attacks by refusing to hash large passwords.
    if (password.length > 512) {
        return false;
    }
    // The first 12 characters of an existing hash are its setting string.
    setting = setting.substring(0, 12);
    if (setting[0] != "$" || setting[2] != "$") {
        return false;
    }
    var count_log2;
    count_log2 = _password_get_count_log2(setting);
    // Hashes may be imported from elsewhere, so we allow != DRUPAL_HASH_COUNT
    if (count_log2 < DRUPAL_MIN_HASH_COUNT || count_log2 > DRUPAL_MAX_HASH_COUNT) {
        return false;
    }
    var salt;
    salt = setting.substring(4, 8);
    // Hashes must have an 8 character salt.
    if (salt.length != 8) {
        return false;
    }
    // Convert the base 2 logarithm into an integer.
    var count;
    count = 1 << count_log2;
    // We rely on the hash() function being available in PHP 5.2+.
    var hash;
    hash = hash(algo, salt.password, true);
    __loop1:
        do {
            hash = hash(algo, hash.password, true);
        } while (--count);
    var len;
    len = hash.length;
    var output;
    output = setting._password_base64_encode(hash, len);
    // _password_base64_encode() of a 16 byte MD5 will always be 22 characters.
    // _password_base64_encode() of a 64 byte sha512 will always be 86 characters.
    var expected;
    expected = 12 + ceil(8 * len / 6);
    return output.length == expected ? output.substring(0, DRUPAL_HASH_LENGTH) : false;
}
/**
 * Parse the log2 iteration count from a stored hash or setting string.
 */
function _password_get_count_log2(setting) {
    var itoa64;
    itoa64 = _password_itoa64();
    return itoa64.indexOf(setting[3]);
}
/**
 * Hash a password using a secure hash.
 *
 * @param password
 *   A plain-text password.
 * @param count_log2
 *   Optional integer to specify the iteration count. Generally used only during
 *   mass operations where a value less than the default is needed for speed.
 *
 * @return
 *   A string containing the hashed password (and a salt), or FALSE on failure.
 */

function user_hash_password(password, count_log2) {
    if (typeof count_log2 == 'undefined') count_log2 = 0;
    if (empty(count_log2)) {
        // Use the standard iteration count.
        count_log2 = variable_get("password_count_log2", DRUPAL_HASH_COUNT);
    }
    return _password_crypt("sha512", password, _password_generate_salt(count_log2));
}
/**
 * Check whether a plain text password matches a stored hashed password.
 *
 * Alternative implementations of this function may use other data in the
 * $account object, for example the uid to look up the hash in a custom table
 * or remote database.
 *
 * @param password
 *   A plain-text password
 * @param account
 *   A user object with at least the fields from the {users} table.
 *
 * @return
 *   TRUE or FALSE.
 */
function user_check_password(password, account) {
    if (account.pass.substring(0, 2) === "U$") {
        // This may be an updated password from user_update_7000(). Such hashes
        // have 'U' added as the first character and need an extra md5().
        var stored_hash;
        stored_hash = account.pass.substring(1);
        password = md5(password);
    } else {
        stored_hash = account.pass;
    }
    console.log(stored_hash);
    var type;
    type = stored_hash.substring(0, 3);
    __loop1:
        switch (type) {
            case "$S$":
                // A normal Drupal 7 password using sha512.
                var hash;
                hash = _password_crypt("sha512", password, stored_hash);
                break;
            case "$H$":
                // phpBB3 uses "$H$" for the same thing as "$P$".
                // phpBB3 uses "$H$" for the same thing as "$P$".
            case "$P$":
                // A phpass password generated using md5.  This is an
                // imported password or from an earlier Drupal version.
                hash = _password_crypt("md5", password, stored_hash);
                break;
            default:
                return false;
        }
    return hash && stored_hash == hash;
}
/**
 * Check whether a user's hashed password needs to be replaced with a new hash.
 *
 * This is typically called during the login process when the plain text
 * password is available. A new hash is needed when the desired iteration count
 * has changed through a change in the variable password_count_log2 or
 * DRUPAL_HASH_COUNT or if the user's password hash was generated in an update
 * like user_update_7000().
 *
 * Alternative implementations of this function might use other criteria based
 * on the fields in $account.
 *
 * @param account
 *   A user object with at least the fields from the {users} table.
 *
 * @return
 *   TRUE or FALSE.
 */
function user_needs_new_hash(account) {
    // Check whether this was an updated password.
    if (account.pass.substring(0, 3) != "$S$" || account.pass.length != DRUPAL_HASH_LENGTH) {
        return true;
    }
    // Ensure that $count_log2 is within set bounds.
    var count_log2;
    count_log2 = _password_enforce_log2_boundaries(variable_get("password_count_log2", DRUPAL_HASH_COUNT));
    // Check whether the iteration count used differs from the standard number.
    return _password_get_count_log2(account.pass) !== count_log2;
}

module.exports = { 
    _password_itoa64, 
    _password_base64_encode, 
    _password_generate_salt,
    _password_enforce_log2_boundaries,
    _password_crypt,
    _password_get_count_log2,
    user_hash_password,
    user_check_password,
    user_needs_new_hash
}
