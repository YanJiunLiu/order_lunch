import urllib.request
import urllib.error

def test_oauth():
    url = "https://welfare.ieiworld.com/oauth_aad/login.php?op=aad_login"
    req = urllib.request.Request(url)
    try:
        with urllib.request.urlopen(req) as response:
            print(f"Status Code: {response.status}")
            print(f"URL: {response.geturl()}")
            print(f"Headers:\n{response.headers}")
    except urllib.error.URLError as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_oauth()
