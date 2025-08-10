## despite the name this can be used for any mongo db field where a user can input a string

# Characters that have special meaning in MongoDB or could cause issues
invalid_chars = set([
    '(',
    ')',
    '[',
    ']',
    '{',
    '}',
    '.',
    '*',
    '+',
    '?',
    '^',
    '$',
    '|',
    '\\',
    '/',
    "'",
    '"',
    '`',
    '&',
    '<',
    '>',
    '%',
    '#',
    '@',
    ':',
    ';',
    '=',
    '\x00',  # Null character
])


def remove_invalid_username_characters(
        old_name,
        replace_spaces_with_underscores:bool = False,
        remove_newlines:bool = False
    ):
    """
    Removes characters that could cause issues in MongoDB queries or string operations.
    Preserves alphanumeric characters and underscores for username safety.
    
    Args:
        old_name (str): The original username string
        
    Returns:
        str: Sanitized username string
    """
    # Replace spaces with underscores
    if replace_spaces_with_underscores:
        old_name = old_name.replace(' ', '_')

    # Replace newlines with spaces
    if remove_newlines:
        old_name = old_name.replace('\n', '')
    
    # Remove any invalid characters
    parsed_name = ''.join(
        char for char in old_name if char not in invalid_chars
    )
    
    return parsed_name
