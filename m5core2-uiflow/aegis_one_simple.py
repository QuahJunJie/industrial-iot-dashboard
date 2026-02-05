# ============================================================================
# AegisOne M5Core2 - Simplified Version for UIFlow
# Copy this into UIFlow's Python editor
# ============================================================================

from m5stack import *
from m5stack_ui import *
from uiflow import *
from IoTcloud.AWS import AWS
import wifiCfg
import json
import imu

# ============= CONFIGURATION - EDIT THESE =============
WIFI_SSID = 'YOUR_WIFI'
WIFI_PASSWORD = 'YOUR_PASSWORD'

AWS_THING_NAME = 'AegisOne_M5_01'
AWS_HOST = 'your-endpoint.iot.ap-southeast-1.amazonaws.com'
AWS_CERT = '/flash/res/cert.crt'
AWS_KEY = '/flash/res/private.pem.key'

DEVICE_ID = 'aegis-one-m5-01'
TOPIC_TELEMETRY = 'aegisone/telemetry'
# ======================================================

# Initialize
screen = M5Screen()
screen.clean_screen()
screen.set_screen_bg_color(0x1a1a2e)

# UI Labels
lblTitle = M5Label('AegisOne Monitor', x=10, y=10, color=0x22c55e, font=FONT_MONT_18, parent=None)
lblStatus = M5Label('Initializing...', x=200, y=15, color=0x94a3b8, font=FONT_MONT_12, parent=None)

lblTempTitle = M5Label('TEMPERATURE', x=20, y=60, color=0x94a3b8, font=FONT_MONT_10, parent=None)
lblTemp = M5Label('--.- C', x=20, y=80, color=0xffffff, font=FONT_MONT_26, parent=None)

lblVibTitle = M5Label('VIBRATION', x=180, y=60, color=0x94a3b8, font=FONT_MONT_10, parent=None)
lblVib = M5Label('--.- g', x=180, y=80, color=0xffffff, font=FONT_MONT_26, parent=None)

lblDistTitle = M5Label('DISTANCE', x=20, y=130, color=0x94a3b8, font=FONT_MONT_10, parent=None)
lblDist = M5Label('--- cm', x=20, y=150, color=0x22c55e, font=FONT_MONT_22, parent=None)

lblUpdate = M5Label('Last: --:--:--', x=10, y=200, color=0x94a3b8, font=FONT_MONT_10, parent=None)

# IMU for vibration
imu0 = imu.IMU()
aws = None
connected = False

def get_temp():
    """Read temperature - modify for your sensor"""
    # For ENV III: return env3.temperature
    # Simulated using battery voltage
    return 25.0 + (power.getBatVoltage() - 3.7) * 10

def get_vibration():
    """Read vibration from IMU"""
    ax, ay, az = imu0.acceleration
    mag = ((ax**2 + ay**2 + az**2) ** 0.5) - 1.0
    return abs(mag)

def get_distance():
    """Read ultrasonic - modify pins for your setup"""
    # If no ultrasonic, return a default
    return 150.0

def get_status(temp, vib):
    """Determine status"""
    if temp > 45 or vib > 2.5:
        return "CRITICAL"
    elif temp > 35 or vib > 1.5:
        return "WARNING"
    return "RUNNING"

def update_display(temp, vib, dist, status):
    """Update screen"""
    lblTemp.set_text('{:.1f} C'.format(temp))
    lblVib.set_text('{:.2f} g'.format(vib))
    lblDist.set_text('{:.0f} cm'.format(dist))
    lblStatus.set_text(status)
    
    # Color coding
    if status == "CRITICAL":
        lblStatus.set_text_color(0xef4444)
        speaker.tone(2000, 100)
    elif status == "WARNING":
        lblStatus.set_text_color(0xf59e0b)
    else:
        lblStatus.set_text_color(0x22c55e)
    
    # Timestamp
    t = time.localtime()
    lblUpdate.set_text('Last: {:02d}:{:02d}:{:02d}'.format(t[3], t[4], t[5]))

def publish_data(temp, vib, dist, status):
    """Send to AWS IoT"""
    global aws
    if aws is None:
        return
    
    payload = json.dumps({
        "deviceId": DEVICE_ID,
        "temp": round(temp, 2),
        "vib": round(vib, 3),
        "distance": round(dist, 1),
        "status": status,
        "ts": int(time.time() * 1000)
    })
    
    try:
        aws.publish(TOPIC_TELEMETRY, payload)
    except:
        pass

# ============= CONNECT WIFI =============
lblStatus.set_text('WiFi...')
wifiCfg.doConnect(WIFI_SSID, WIFI_PASSWORD)

retry = 0
while not wifiCfg.wlan_sta.isconnected() and retry < 15:
    wait(1)
    retry += 1

if wifiCfg.wlan_sta.isconnected():
    lblStatus.set_text('AWS...')
    lblStatus.set_text_color(0x22c55e)
    
    # ============= CONNECT AWS =============
    try:
        aws = AWS(
            things_name=AWS_THING_NAME,
            host=AWS_HOST,
            port=8883,
            keepalive=60,
            cert_file_path=AWS_CERT,
            private_key_path=AWS_KEY
        )
        aws.start()
        connected = True
        lblStatus.set_text('ONLINE')
    except Exception as e:
        lblStatus.set_text('AWS Err')
        lblStatus.set_text_color(0xef4444)
else:
    lblStatus.set_text('No WiFi')
    lblStatus.set_text_color(0xef4444)

# ============= MAIN LOOP =============
while True:
    # Read sensors
    temp = get_temp()
    vib = get_vibration()
    dist = get_distance()
    status = get_status(temp, vib)
    
    # Update display
    update_display(temp, vib, dist, status)
    
    # Publish to AWS
    if connected:
        publish_data(temp, vib, dist, status)
    
    # Wait 5 seconds
    wait(5)
