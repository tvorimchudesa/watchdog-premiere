"""
Extract key frames from Watchtower review video at important timestamps.
Uses ffmpeg to grab screenshots at moments showing UI and features.
"""

import subprocess
import os

VIDEO_PATH = r"C:\Users\TVORIM\Desktop\watchTowerVideo.mp4"
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "screenshots")

# Key timestamps with descriptions (analyzed from transcript)
# Format: (timestamp, filename_suffix)
KEYFRAMES = [
    ("00:00:05", "01_intro"),
    ("00:00:20", "02_import_performance"),
    ("00:00:24", "03_instant_import_autosync"),
    ("00:00:31", "04_manual_sync_speed"),
    ("00:00:39", "05_autosync_demo"),
    ("00:00:47", "06_wait_for_file_write"),
    ("00:00:57", "07_main_panel_overview"),
    ("00:01:00", "08_progress_bar"),
    ("00:01:05", "09_autosync_toggle_button"),
    ("00:01:11", "10_autosync_eye_icon"),
    ("00:01:14", "11_rightclick_settings_menu"),
    ("00:01:19", "12_drag_drop_folders"),
    ("00:01:25", "13_folders_panel"),
    ("00:01:30", "14_folders_panel_drag_drop"),
    ("00:01:35", "15_folder_settings_state"),
    ("00:01:40", "16_folder_online_offline"),
    ("00:01:47", "17_offline_folder_path"),
    ("00:01:54", "18_fix_missing_folder"),
    ("00:02:02", "19_four_checkboxes_overview"),
    ("00:02:05", "20_sub_checkbox_subfolders"),
    ("00:02:11", "21_relative_path_checkbox"),
    ("00:02:18", "22_relative_path_use_case"),
    ("00:02:29", "23_seq_image_sequence"),
    ("00:02:37", "24_image_seq_auto_detect"),
    ("00:02:46", "25_flt_flatten_folder"),
    ("00:02:54", "26_flatten_demo"),
    ("00:03:05", "27_seq_plus_flatten_demo"),
    ("00:03:14", "28_flatten_result"),
    ("00:03:19", "29_camera_cards_structure"),
    ("00:03:25", "30_camera_auto_detect"),
    ("00:03:35", "31_red_p2_panasonic_arri"),
    ("00:03:51", "32_camera_import_result"),
    ("00:03:57", "33_supported_cameras_docs"),
    ("00:04:02", "34_tooltip_hover"),
    ("00:04:09", "35_label_feature_new"),
    ("00:04:14", "36_label_assign_demo"),
    ("00:04:23", "37_labeled_timeline"),
    ("00:04:35", "38_timeline_organized"),
    ("00:04:40", "39_bins_to_watch_folders"),
    ("00:04:49", "40_drag_bins_link_icon"),
    ("00:04:55", "41_bins_linked_panel"),
    ("00:05:02", "42_auto_parent_folder_path"),
    ("00:05:08", "43_change_path_click"),
    ("00:05:13", "44_settings_file_extensions"),
    ("00:05:18", "45_ignored_folder_names"),
    ("00:05:24", "46_regex_folder_filter"),
    ("00:05:32", "47_show_import_options"),
    ("00:05:40", "48_after_effects_import"),
    ("00:05:48", "49_import_date_feature"),
    ("00:05:55", "50_metadata_display_setup"),
    ("00:06:09", "51_import_date_in_action"),
    ("00:06:18", "52_date_format_sortable"),
    ("00:06:27", "53_import_date_performance_note"),
    ("00:06:41", "54_progress_bar_useful"),
    ("00:06:48", "55_version_15_note"),
]


def extract_frames():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    if not os.path.isfile(VIDEO_PATH):
        print(f"ERROR: Video not found at {VIDEO_PATH}")
        return

    total = len(KEYFRAMES)
    for i, (timestamp, name) in enumerate(KEYFRAMES, 1):
        output_path = os.path.join(OUTPUT_DIR, f"{name}.png")
        cmd = [
            "ffmpeg", "-y",
            "-ss", timestamp,
            "-i", VIDEO_PATH,
            "-frames:v", "1",
            "-q:v", "2",
            output_path,
        ]
        result = subprocess.run(cmd, capture_output=True, text=True)
        status = "OK" if result.returncode == 0 else "FAIL"
        print(f"[{i}/{total}] {status} — {timestamp} — {name}")

    print(f"\nDone! Screenshots saved to: {OUTPUT_DIR}")


if __name__ == "__main__":
    extract_frames()
