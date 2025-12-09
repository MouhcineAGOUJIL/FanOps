import xml.etree.ElementTree as ET
import sys
import os

# Configuration: File Path, Shift X, Shift Y, Name Prefix
SERVICES = [
    # M2: AWS Security
    {"path": "/home/red/Documents/S5/Cloud/FanOps/M2-security-aws/M2_Arch.xml", "x": 0, "y": 0, "prefix": "m2_"},
    # M1: Azure Flow (Shifted Right)
    {"path": "/home/red/Documents/S5/Cloud/FanOps/M1-flow-azure/M1_Arch.xml", "x": 1500, "y": 0, "prefix": "m1_"},
    # M3: AWS Forecast (Shifted Right)
    {"path": "/home/red/Documents/S5/Cloud/FanOps/M3-forecast-aws/M3_Arch.xml", "x": 3000, "y": 0, "prefix": "m3_"},
    # M4: GCP Sponsor (Shifted Right)
    {"path": "/home/red/Documents/S5/Cloud/FanOps/M4-sponsor-gcp/M4_Arch.xml", "x": 4500, "y": 0, "prefix": "m4_"}
]

# Sentinel Integration Points (Source ID in original file -> Target in Unified Sentinel)
# Note: These IDs must be accurate from the source files.
SENTINEL_LINKS = [
    {"service": "m2_", "src_id": "lambda_sentinel", "desc": "Security Logs"},
    {"service": "m1_", "src_id": "proc_ingest", "desc": "App Insights"}, # Fallback if specific ID varies
    {"service": "m3_", "src_id": "lambda_func", "desc": "CloudWatch"},
    {"service": "m4_", "src_id": "cloud_run", "desc": "Cloud Logging"}
]

OUTPUT_PATH = "/home/red/Documents/S5/Cloud/FanOps/FanOps_Unified_Arch.xml"

def main():
    # 1. Create Base XML Structure (Canvas)
    root = ET.Element("mxfile", {"host": "app.diagrams.net", "agent": "Mozilla/5.0"})
    diagram = ET.SubElement(root, "diagram", {"id": "Unified-All", "name": "Unified Architecture"})
    model = ET.SubElement(diagram, "mxGraphModel", {
        "dx": "0", "dy": "0", "grid": "1", "gridSize": "10", 
        "guides": "1", "tooltips": "1", "connect": "1", "arrows": "1", 
        "fold": "1", "page": "1", "pageScale": "1", 
        "pageWidth": "8000", "pageHeight": "3000", "math": "0", "shadow": "0"
    })
    root_cell = ET.SubElement(model, "root")
    ET.SubElement(root_cell, "mxCell", {"id": "0"})
    ET.SubElement(root_cell, "mxCell", {"id": "1", "parent": "0"})

    # 2. Add Unified Sentinel Layer at the Bottom (Global)
    # y=1600 (Assuming services take up ~1500 height max)
    sentinel_y = 1600
    
    # Layer Box
    sentinel_zone = ET.SubElement(root_cell, "mxCell", {
        "id": "global_sentinel_zone", "value": "Unified Security Operations Center (USOC)",
        "style": "swimlane;whiteSpace=wrap;html=1;fillColor=#E8EAF6;strokeColor=#3F51B5;fontColor=#1A237E;startSize=30;rounded=1;",
        "parent": "1", "vertex": "1"
    })
    ET.SubElement(sentinel_zone, "mxGeometry", {"x": "40", "y": str(sentinel_y), "width": "6000", "height": "300", "as": "geometry"})

    # Log Analytics Icon
    sentinel_la = ET.SubElement(root_cell, "mxCell", {
        "id": "global_la", "value": "Log Analytics",
        "style": "image;image=img/lib/azure2/management_governance/Log_Analytics_Workspaces.svg;",
        "parent": "global_sentinel_zone", "vertex": "1"
    })
    ET.SubElement(sentinel_la, "mxGeometry", {"x": "2800", "y": "80", "width": "100", "height": "100", "as": "geometry"})

    # sentinel Icon
    sentinel_icon = ET.SubElement(root_cell, "mxCell", {
        "id": "global_sentinel", "value": "Azure Sentinel",
        "style": "image;image=img/lib/mscae/Azure_Sentinel.svg;",
        "parent": "global_sentinel_zone", "vertex": "1"
    })
    ET.SubElement(sentinel_icon, "mxGeometry", {"x": "3100", "y": "70", "width": "120", "height": "120", "as": "geometry"})

    # Link LA -> Sentinel
    edge = ET.SubElement(root_cell, "mxCell", {
        "id": "link_la_sentinel", "value": "Ingest",
        "style": "edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;strokeWidth=3;strokeColor=#3F51B5;",
        "parent": "global_sentinel_zone", "edge": "1", "source": "global_la", "target": "global_sentinel"
    })
    ET.SubElement(edge, "mxGeometry", {"relative": "1", "as": "geometry"})


    # 3. Process Each Service
    for svc in SERVICES:
        if not os.path.exists(svc["path"]):
            print(f"Skipping {svc['path']} (Not Found)")
            continue
            
        try:
            tree = ET.parse(svc["path"])
            src_root = tree.getroot()
            # Find model root
            src_model = src_root.find(".//mxGraphModel")
            if src_model is None: continue
            src_cells = src_model.find("root")
            
            # Map IDs to avoid Collisions
            id_map = {} # old -> new
            
            # Pass 1: Map IDs
            for cell in src_cells:
                old_id = cell.get("id")
                if old_id in ["0", "1"]: continue
                new_id = svc["prefix"] + old_id
                id_map[old_id] = new_id
            
            # Pass 2: Copy & Shift
            for cell in src_cells:
                old_id = cell.get("id")
                if old_id not in id_map: continue
                
                # Clone Attributes
                new_attrs = cell.attrib.copy()
                new_attrs["id"] = id_map[old_id]
                
                # Remap Parent
                old_parent = new_attrs.get("parent")
                if old_parent in id_map:
                    new_attrs["parent"] = id_map[old_parent]
                elif old_parent == "1":
                    new_attrs["parent"] = "1" # Top level
                else:
                    # Parent might be 0 or missing, default to 1 if it was a visible node
                    if "vertex" in new_attrs or "edge" in new_attrs:
                        new_attrs["parent"] = "1"
                
                # Remap Source/Target (Edges)
                if "source" in new_attrs and new_attrs["source"] in id_map:
                    new_attrs["source"] = id_map[new_attrs["source"]]
                if "target" in new_attrs and new_attrs["target"] in id_map:
                    new_attrs["target"] = id_map[new_attrs["target"]]
                
                # Create Cell
                new_cell = ET.SubElement(root_cell, "mxCell", new_attrs)
                
                # Handle Geometry (Shift X/Y)
                geo = cell.find("mxGeometry")
                if geo is not None:
                    new_geo = ET.SubElement(new_cell, "mxGeometry", geo.attrib.copy())
                    # Only shift if parent represents the diagram root
                    if new_attrs.get("parent") == "1":
                        try:
                            x = float(new_geo.get("x", "0"))
                            y = float(new_geo.get("y", "0"))
                            new_geo.set("x", str(x + svc["x"]))
                            new_geo.set("y", str(y + svc["y"]))
                        except: pass
                    
                    # Copy Points
                    for pt in geo:
                        new_geo.append(pt)
                
                # Copy Styles/Content
                for child in cell:
                    if child.tag != "mxGeometry":
                        new_cell.append(child)

        except Exception as e:
            print(f"Error processing {svc['path']}: {e}")

    # 4. Create Links to Sentinel
    for link in SENTINEL_LINKS:
        # Source ID is prefixed
        full_src_id = link["service"] + link["src_id"]
        # Allow checking if ID exists in final XML? 
        # We assume it does. Draw.io ignores invalid edges usually.
        
        edge = ET.SubElement(root_cell, "mxCell", {
            "id": f"link_sentinel_{link['service']}",
            "value": link["desc"],
            "style": "edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;dashed=1;strokeWidth=2;strokeColor=#FF0000;entryX=0.5;entryY=0;",
            "edge": "1",
            "parent": "1",
            "source": full_src_id,
            "target": "global_la"
        })
        ET.SubElement(edge, "mxGeometry", {"relative": "1", "as": "geometry"})

    # Write
    tree = ET.ElementTree(root)
    tree.write(OUTPUT_PATH, encoding="UTF-8", xml_declaration=True)
    print("Generation Complete")

if __name__ == "__main__":
    main()
