

export default {
  DML_CODE_MESSAGE: {
    E100: "Bad Request",
    E101: "Invalid authentication!",
    E103: "User Inactive!",
    I104: "Your account is locked please check you'r mail!",
    I105: "Your account is locked please contact support!",
    E105: "Email Address/Username not found, Please provide valid Email Address/Username!!",
    E112: "Query Failed!",
    E116: "New password should not be same as old password!",
    E118: "User doesn't exist!",
    E119: "Session Expired!!!",
    E121: "Forbidden: Invalid userID",
    E122: "Email Address not found, Please provide valid Email Address!",
    S102: "Login successful!",
    S110 : "Email Address/Username not found, Please provide valid Email Address/Username!!",
    S116 : "Invalid Parameter!",
    S117:"Password changed successfully",
    S128: "Email provided already registered",
  },
  DML_STATUS_CODE: {
    ERROR: "E",
    SUCCESS: "S",
  },
  STATUS_NUMBER: {
    "SUCCESS": 201,
    "ERROR": 409,
    "PROCEDURE_FAIL": 302,
    "BAD_REQUEST": 310,
  },
  CRYPTOGRAPHY: {
    AES: {
      KEY: "7848358d48481eeb6f8304de0a13474f",
      IV_LENGTH: 16,
      ALGORITHM: 'aes-256-cbc'
    },
    RSA: {
      PRIVATE_KEY:  '-----BEGIN PRIVATE KEY-----\n'+
      'MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDed1kFYs5gPsXl\n' +
      'qpkC8cHpxkaTy1BjLD1O+2YPfC41PR3znPR8kUK420Dg/7k473qvBPWsNhIKiiDd\n' +
      'tPSwqcd2+Kn4/t/kxJ1f8Ia/aywjSU/DV7Vx8sOlMvfG9La1jyQqFXRGc/XkCj2T\n' +
      'XGmeN+PhKtXRLjZHtI+2d8N2h7SoddzKX2GNQxGtQ+bzFSm7uW02LOokKymOd+xs\n' +
      'MavwhIDFtQyFQkt9h5ulyKoaL8ZmPxT1kItyfi/dZicsp8U6xyQxERJEBZ+GWDPS\n' +
      'g3lY0PqJ+fehavnvhiU+/zGnMWjW3FSLXjvVcxkTau6RQDm6w8/KG74iOq5PDg9H\n' +
      'YDsZ4GHvAgMBAAECggEAGCFA3iUv9l+IrpcY/qlDW7x+ZkR8xS0Ev17kXJSfHHYz\n' +
      'G/vvxt0orA1YFa+XIxZSq84xaYr53PvLgdDBY7IeqQhiw1e96D3tRf08WGHjCTbH\n' +
      '+Iu4ahInZ3FGT+W2Na4/gXMPSB8G0kPMFwJEkH1GceNoCsbk61Up62RFJsOkdEsU\n' +
      'mLRTVUOcWzCoFZdzHaTnTcCQVbbJFH2+fqlt699RtXf270Ke8cQOTDixHMsWxMdv\n' +
      '4ockxsSfZF12zO0Q5GdZ/j6DM+htO+iBcXcRofPhxndrG8DZiOTlo6/gdVB+36h9\n' +
      'vwrMCilRV6Vw43puPqW59l9BR3nmRQDlqPQdbqVrtQKBgQD9jt6IwUZXSYrwRYDf\n' +
      'vBdTQO4hSdEl5c3FYxbUc+1oqQ6ALmKLlDZu7tZeCVnDZ3rJYoskzM5QxkfY+fB/\n' +
     ' lyqFwTab7LcdO/iLQ9OAcTnGHIib2PrRZOfsKzq23hakAZDwxDPuj0QWefgMiz8R\n' +
      'kNcIz+KtdNi/rAQ/jryXaqpj9QKBgQDgm9LPxbR2lXTREkDEVQUV6z0ETP7RduaV\n' +
      'Sx6slYVM/Koij3eAg6I89vE9n//SIUct6y4xZ6PNHsIkQ8FFsbhe7JXAPjgDedSZ\n' +
      'RVP5FX0tUgMC5WmKIOdYutUO+Ryigc19sDSLbznQYVkUA0GKXnggYHBJNa+oaiGl\n' +
      'cnUh5r+j0wKBgQD8lElRaVastPHWjyXlufRyVofgWSwi2Fy2eBLR5/li/KUZQxuf\n' +
      'dzESKJEac64bXQWPfr6lFe+fvyTrG29bajZNrz667H8sfAUGlbYmiKPImbvro6WW\n' +
      '2TG+rQF8EJf1ICpF7Ozeg5CL40wZEszsrp/Gg2+G4pLXvH8u4P00yGib0QKBgB+c\n' +
     ' zub/ZI7sKizi7Mq1TKnxGf1o+NRyb7HDiOWxhbl4Nln251LnNAZwmzOZOWBR3rrP\n' +
      'xwidFajhE2IXRzSP9uslUU5lc2zJ0Ophn5gHNj8Ss+nMcDZIu0b5xNL+rNESg+GU\n' +
      '01Bsry5tBSST8L2Q3kdwS12CeN6zUVj/6wyCdaaRAoGAUivR+yFlCSBUOSrl/vy6\n' +
     ' SPJI1LZbFZQgEeSrd26xciKntfboz/63WspqRDnVn4n+1RtxzxuPkome4whMdifj\n' +
     ' f3X8kfG1ny5j3A9ZR1j6TpBcDv/1GQBNUdt/wcXa/f03Qp18aXy3+sCJ7kxxrrFZ\n' +
     ' sIHni1O+UMaLtQ9ybsWdCi8=\n' +
      '-----END PRIVATE KEY-----',
      PUBLIC_KEY: '-----BEGIN PUBLIC KEY-----\n' +
      'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA3ndZBWLOYD7F5aqZAvHB\n' +
      '6cZGk8tQYyw9TvtmD3wuNT0d85z0fJFCuNtA4P+5OO96rwT1rDYSCoog3bT0sKnH\n' +
      'dvip+P7f5MSdX/CGv2ssI0lPw1e1cfLDpTL3xvS2tY8kKhV0RnP15Ao9k1xpnjfj\n' +
      '4SrV0S42R7SPtnfDdoe0qHXcyl9hjUMRrUPm8xUpu7ltNizqJCspjnfsbDGr8ISA\n' +
      'xbUMhUJLfYebpciqGi/GZj8U9ZCLcn4v3WYnLKfFOsckMRESRAWfhlgz0oN5WND6\n' +
      'ifn3oWr574YlPv8xpzFo1txUi1471XMZE2rukUA5usPPyhu+IjquTw4PR2A7GeBh\n' +
      '7wIDAQAB\n' +
      '-----END PUBLIC KEY-----',
    }
  },
  JWT: {
    SECRETKEY: "ELIT"
  },
};