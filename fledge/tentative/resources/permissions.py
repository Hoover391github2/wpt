"""Methods for the interest group cross-origin permissions endpoint."""
import json
import re

from fledge.tentative.resources import fledge_http_server_util

def get_permissions(request, response):
  """Returns JSON object containing interest group cross-origin permissions.

  The structure returned is described in more detail at
  https://github.com/WICG/turtledove/blob/main/FLEDGE.md#13-permission-delegation.
  This correctly handles requests issued in CORS mode.

  This .well-known is fetched at the origin of the interest group's owner, and
  specifies as a URL parameter the origin of frame that's attempting to join or
  leave that interest group.

  This is implemented such that the origin of the frame is ignored altogether,
  and the determination of which operations are allowed depends strictly on the
  origin of the interest group owner, and specifically on the subdomain of the
  origin of the interest group owner. wptserve serves each of its two domains
  at both the raw domain and each of five subdomains.

  - (no subdomain): returns a 404
  - www: disallows both join and leave
  - www1: allows join, but not leave
  - www2: allows leave, but not join
  - 天気の良い日 / élève: allow both join and leave
  """
  if fledge_http_server_util.handle_cors_headers_and_preflight(request, response):
    return

  subdomain = re.search(r"(?:([^.]+)\.)?[^.]+\.[^.]+", request.url_parts.netloc).group(1)
  if not subdomain:
    response.status = (404, b"Not Found")
    response.content = "Not Found"
    return

  response.status = (200, b"OK")
  response.headers.set(b"Content-Type", b"application/json")
  response.content = json.dumps({
    "joinAdInterestGroup": subdomain not in ["www", "www2"],
    "leaveAdInterestGroup": subdomain not in ["www", "www1"]
  })

