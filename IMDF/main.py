import os
from extract import extract_features
from export import export_imdf

def main():
    base_dir = '/home/purusoni/Classes/CSE453/WayfinderMain/IMDF'
    data_dir = os.path.join(base_dir, 'DXF_out')
    export_dir = os.path.join(base_dir, 'export')
    zip_path = os.path.join(base_dir, 'Lockwood_IMDF_Final.zip')
    
    print("-----------------------------------------")
    print("Wayfinder AI: CAD to IMDF Generation tool")
    print("-----------------------------------------")
    print(f"Reading DXF files from: {data_dir}")
    print("Extracting features (This may take a moment)...")
    
    # 1. Extract Geometry & Properties
    data_dict = extract_features(data_dir)
    
    # 2. Export to GeoJSON & Zip
    print(f"Writing GeoJSON files to: {export_dir}")
    export_imdf(data_dict, export_dir, zip_path)
    
    print("Done.")

if __name__ == "__main__":
    main()
