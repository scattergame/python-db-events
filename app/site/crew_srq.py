import requests
import pandas as pd
from datetime import datetime, timedelta
from bs4 import BeautifulSoup
import json
import time

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    "Accept-Encoding": "identity",
}

def build_crewnetwork_url(base_url, days_ahead=365):
    today = datetime.today().date()
    future = today + timedelta(days=days_ahead)
    return f"{base_url}?minEndDate={today}&maxEndDate={future}"


def get_slug_by_id(events, target_id):
    for event in events:
        if event.get("netforum_event_id") == target_id:
            return event.get("full_slug")
    return None


def clean_slug(full_slug):
    parts = full_slug.strip("/").split("/")
    return "/" + "/".join(parts[2:])


def build_slug_request(base_url, days_ahead=365):
    today = datetime.today().date()
    future = today + timedelta(days=days_ahead)

    params = {
        "from": today.isoformat(),
        "to": future.isoformat(),
        "chapters": "CN,SAR",
        "page": 1,
    }

    resp = requests.get(base_url, params=params)
    if resp.status_code != 200:
        raise RuntimeError(f"Request failed: {resp.status_code}")

    soup = BeautifulSoup(resp.text, "html.parser")
    nxt = soup.find("script", {"id": "__NEXT_DATA__", "type": "application/json"})
    if not nxt:
        raise RuntimeError("`__NEXT_DATA__` script tag not found!")

    try:
        data = json.loads(nxt.string)
    except json.JSONDecodeError:
        raise RuntimeError("Could not decode JSON in `__NEXT_DATA__`.")

    event_slugs = []

    # Trace the path
    try:
        event_slugs = data["props"]["pageProps"]["pageProps"]["story"]["content"][
            "page_template"
        ][0]["storyblok_events"]
        return event_slugs
    except KeyError:
        raise RuntimeError("Could not locate `storyblok_events` in JSON structure.")


def get_event_list(config):
    url = build_crewnetwork_url(config["url"])
    url2 = config["url2"]
    base_url = config["base_url"]
    interval = config.get("scraper_interval", 1)
    # time.sleep(interval)

    print(f"Fetching events from: {url}")

    response = requests.get(url, headers=headers)
    response.raise_for_status()
    all_events = response.json()
    print (f"Fetched {len(all_events)} events.")

    # Step 1: Find qualified events
    qualified_events = []
    for event in all_events:
        if not event.get("netforumId"):
            continue

        if event.get("isVirtual", True):
            continue

        if event.get("chapter")!= "CREW Sarasota/Manatee":
            continue

        qualified_events.append(event)

    print(len(qualified_events), " qualified events found.")

    time.sleep(interval)

    # Step 2: Get event URLs
    print(f"Fetching slug map from: {url2}")
    event_slugs = build_slug_request(url2)
    print(f"Fetched {len(event_slugs)} event slugs.")

    final_events = []

    for event in qualified_events:
        event_id = event["netforumId"]
        full_slug = get_slug_by_id(event_slugs, event_id)
        cleaned_slug = clean_slug(full_slug)
        start_raw = event["startDateTime"]
        end_raw = event["endDateTime"]

        try:
            start_dt = datetime.fromisoformat(start_raw)
            end_dt = datetime.fromisoformat(end_raw)
        except Exception as e:
            print(f"[ERROR] Failed to parse datetime: {e}")
            continue

        event_data = {
            "Event Title": event["title"],
            "Event Link": f"{base_url}{cleaned_slug}",
            "start_dt": start_dt,
            "end_dt": end_dt,
            "Organizer": config.get("organizer"),
            "Industry": config.get("industry"),
            "Market": config.get("market"),
        }

        final_events.append(event_data)

    return final_events


def process(config):
    event_list = get_event_list(config)
    print(f"Collected {len(event_list)} events")

    if event_list:
        df = pd.DataFrame(event_list)
        print(df.to_string(index=False))
        return event_list

    return []
