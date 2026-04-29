import requests

def test():
    url = "https://welfare.ieiworld.com/oauth_aad/login.php?op=aad_login"
    r = requests.get(url, allow_redirects=False)
    print(r.status_code)
    print(r.headers)
    print(r.text[:500])

if __name__ == '__main__':
    test()
