from proposal import tasks
from datetime import datetime
dt = datetime(2016,5,1)
tasks.pull_updates.delay(dt)
