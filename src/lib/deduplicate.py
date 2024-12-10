import os
import hashlib
from collections import defaultdict

def calculate_md5(file_path, chunk_size=8192):
    """Calculate MD5 hash of a file."""
    md5 = hashlib.md5()
    try:
        with open(file_path, "rb") as f:
            while chunk := f.read(chunk_size):
                md5.update(chunk)
    except IOError:
        print(f"Could not read file: {file_path}")
        return None
    return md5.hexdigest()

def find_duplicates(directory):
    """Find duplicate files in a directory by content."""
    file_hashes = defaultdict(list)
    
    for root, _, files in os.walk(directory):
        for file in files:
            file_path = os.path.join(root, file)
            file_hash = calculate_md5(file_path)
            if file_hash:
                file_hashes[file_hash].append(file_path)
    
    duplicates = {hash: paths for hash, paths in file_hashes.items() if len(paths) > 1}
    return duplicates

def delete_duplicates(duplicates):
    """Delete all but one file in each duplicate group."""
    for paths in duplicates.values():
        for file_to_delete in paths[1:]:  # Keep the first file, delete others
            try:
                os.remove(file_to_delete)
                print(f"Deleted: {file_to_delete}")
            except OSError as e:
                print(f"Error deleting file {file_to_delete}: {e}")

if __name__ == "__main__":
    directory_to_scan = input("Enter the directory to scan for duplicates: ").strip()
    duplicates = find_duplicates(directory_to_scan)
    
    if not duplicates:
        print("No duplicate files found.")
    else:
        print("Duplicate files found:")
        for hash, paths in duplicates.items():
            print(f"Hash: {hash}")
            for path in paths:
                print(f" - {path}")
        
        delete_choice = input("Do you want to delete duplicates? (yes/no): ").strip().lower()
        if delete_choice in ["yes", "y"]:
            delete_duplicates(duplicates)
            print("Duplicates deleted.")
        else:
            print("No files were deleted.")