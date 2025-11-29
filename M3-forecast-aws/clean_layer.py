import os
import shutil
import glob

LAYER_DIR = 'layer/python'

def remove_numpy():
    numpy_dir = os.path.join(LAYER_DIR, 'numpy')
    if os.path.exists(numpy_dir):
        print(f"Removing {numpy_dir}...")
        shutil.rmtree(numpy_dir)
    
    # Also remove numpy libs if any (sometimes in .libs)
    for path in glob.glob(os.path.join(LAYER_DIR, 'numpy*')):
        if os.path.isdir(path):
            print(f"Removing {path}...")
            shutil.rmtree(path)

def remove_tests():
    for root, dirs, files in os.walk(LAYER_DIR):
        for d in dirs:
            if d == 'tests' or d == 'test':
                path = os.path.join(root, d)
                print(f"Removing {path}...")
                shutil.rmtree(path)
        
        if '__pycache__' in dirs:
            path = os.path.join(root, '__pycache__')
            print(f"Removing {path}...")
            shutil.rmtree(path)

def remove_dist_info():
    for path in glob.glob(os.path.join(LAYER_DIR, '*.dist-info')):
        print(f"Removing {path}...")
        shutil.rmtree(path)

if __name__ == "__main__":
    # remove_numpy()
    remove_tests()
    remove_dist_info()
    print("Cleanup complete.")
