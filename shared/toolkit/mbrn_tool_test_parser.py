import re
from typing import List

def extract_emails(text: str) -> List[str]:
    # Regex pattern to match email addresses
    email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
    
    # Find all matches in the text
    matches = re.findall(email_pattern, text)
    
    # Return sorted list of unique email addresses
    return sorted(set(matches))

# Self-test block
def test_extract_emails():
    test_text1 = "Contact me at example@example.com or anyuser@domain.co."
    test_text2 = "Here are some emails: user@example.com, admin@yahoo.com, info@company.org"
    test_text3 = "No valid emails here 123@"
    
    assert extract_emails(test_text1) == ['anyuser@domain.co', 'example@example.com']
    assert extract_emails(test_text2) == ['admin@yahoo.com', 'info@company.org', 'user@example.com']
    assert extract_emails(test_text3) == []
    
    print("All tests passed.")

# Run the self-test
test_extract_emails()