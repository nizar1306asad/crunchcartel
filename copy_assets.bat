@echo off
set SRC=C:\Users\Arcz\.gemini\antigravity\brain\10c59e9e-3b7e-4768-bf02-bafeb6f7dadb\.user_uploaded
if not exist assets\images mkdir assets\images

copy /y "%SRC%\media_1794463140592_199e7965.jpg" assets\images\logo.jpg
copy /y "%SRC%\media_1794463127289_52584940.jpg" assets\images\cartel-wrap.jpg
copy /y "%SRC%\media_1794463127307_5e9967ef.jpg" assets\images\kingpin-burger.jpg
copy /y "%SRC%\media_1794463127328_e3c3173e.jpg" assets\images\kingpin-tower.jpg
copy /y "%SRC%\media_1794463128300_c11fe4f8.jpg" assets\images\gangster-wings.jpg
copy /y "%SRC%\media_1794463128310_b2ef70f3.jpg" assets\images\chicken-dip.jpg
copy /y "%SRC%\media_1794463128331_a73350c1.jpg" assets\images\cartel-wrap-2.jpg
copy /y "%SRC%\media_1794463128348_824086e3.jpg" assets\images\broast-combo.jpg
copy /y "%SRC%\media_1794463128829_7f242316.jpg" assets\images\broast-fries.jpg
copy /y "%SRC%\media_1794463128851_b4f2f9b4.jpg" assets\images\double-hiest-hand.jpg
copy /y "%SRC%\media_1794463128925_79ba0126.jpg" assets\images\mafia-broast.jpg
copy /y "%SRC%\media_1794463139829_467df794.jpg" assets\images\menu-page-1.jpg
copy /y "%SRC%\media_1794463139832_72c13154.jpg" assets\images\menu-page-2.jpg

dir assets\images
