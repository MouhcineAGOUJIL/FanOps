import xml.etree.ElementTree as ET
import sys
import os

# Paths to the 4 service architecture files
FILES = {
    "m2": {"path": "/home/red/Documents/S5/Cloud/FanOps/M2-security-aws/M2_Arch.xml", "x": 40, "y": 240},
    "m1": {"path": "/home/red/Documents/S5/Cloud/FanOps/M1-flow-azure/M1_Arch.xml", "x": 1600, "y": 240},
    "m3": {"path": "/home/red/Documents/S5/Cloud/FanOps/M3-forecast-aws/M3_Arch.xml", "x": 3800, "y": 240},
    "m4": {"path": "/home/red/Documents/S5/Cloud/FanOps/M4-sponsor-gcp/M4_Arch.xml", "x": 5400, "y": 240}
}
OUTPUT_FILE = "/home/red/Documents/S5/Cloud/FanOps/FanOps_Unified_Arch.xml"

# IDs to link to (Entry points for client, Log sources for Sentinel)
LINKS = {
    "m2": {"client_target": "api_gw", "sentinel_source": "lambda_sentinel"},
    "m1": {"client_target": "proc_ingest", "sentinel_source": "mroBnqRXuFVucQYZ-Xf6-1"}, # Azure Function
    "m3": {"client_target": "api_gw", "sentinel_source": "lambda_func"},
    "m4": {"client_target": "proc_valid", "sentinel_source": "cloud_run"}
}

def create_base_diagram():
    root_xml = '''<mxfile host="app.diagrams.net" agent="Mozilla/5.0" version="26.0.4">
  <diagram id="Unified-FanOps-Complete" name="Unified Architecture Complete">
    <mxGraphModel dx="0" dy="0" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="7000" pageHeight="2000" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
        
        <!-- GLOBAL CLIENT LAYER -->
        <mxCell id="zone_client_unified" connectable="0" parent="1" style="group" value="FanOps Web Application" vertex="1">
          <mxGeometry x="40" y="40" width="6700" height="150" as="geometry" />
        </mxCell>
        <mxCell id="bg_client_unified" parent="zone_client_unified" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#F5F5F5;strokeColor=#BDBDBD;dashed=1;" value="" vertex="1">
           <mxGeometry width="6700" height="150" as="geometry" />
        </mxCell>
        <mxCell id="client_unified" parent="zone_client_unified" style="sketch=0;pointerEvents=1;shadow=0;dashed=0;html=1;strokeColor=none;fillColor=#505050;labelPosition=center;verticalLabelPosition=bottom;verticalAlign=top;align=center;outlineConnect=0;shape=mxgraph.office.devices.laptop;" value="FanOps Dashboard&#xa;(React/Vite)" vertex="1">
           <mxGeometry x="3350" y="50" width="100" height="60" as="geometry" />
        </mxCell>

        <!-- GLOBAL SENTINEL LAYER -->
        <mxCell id="zone_sentinel_unified" parent="1" style="swimlane;whiteSpace=wrap;html=1;fillColor=#E8EAF6;strokeColor=#3F51B5;fontColor=#1A237E;rounded=1;" value="Unified Security Operations Center (USOC) - Azure Sentinel" vertex="1">
          <mxGeometry x="40" y="1400" width="6700" height="300" as="geometry" />
        </mxCell>
        <mxCell id="sentinel_la_unified" parent="zone_sentinel_unified" style="image;image=img/lib/azure2/management_governance/Log_Analytics_Workspaces.svg;" value="Log Analytics&#xa;Workspace" vertex="1">
           <mxGeometry x="3100" y="80" width="100" height="100" as="geometry" />
        </mxCell>
         <mxCell id="sentinel_logo_unified" parent="zone_sentinel_unified" style="image;image=img/lib/mscae/Azure_Sentinel.svg;" value="Azure Sentinel&#xa;(SIEM/SOAR)" vertex="1">
           <mxGeometry x="3400" y="70" width="120" height="120" as="geometry" />
        </mxCell>
        <mxCell id="c_sentinel_ingest_unified" edge="1" parent="zone_sentinel_unified" source="sentinel_la_unified" target="sentinel_logo_unified" style="edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;strokeWidth=3;strokeColor=#3F51B5;" value="Analysis">
           <mxGeometry relative="1" as="geometry" />
        </mxCell>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>'''
    return ET.ElementTree(ET.fromstring(root_xml))

def merge_files():
    final_tree = create_base_diagram()
    root_el_final = final_tree.getroot().find(".//root")
    
    # Track ID mappings to fix relationships
    # global_id_map maps "prefix_OldID" -> "prefix_OldID" (mostly exact, just prefixed)
    
    for prefix, config in FILES.items():
        if not os.path.exists(config["path"]):
            print(f"File not found: {config['path']}")
            continue

        try:
            tree = ET.parse(config["path"])
            root = tree.getroot()
            model = root.find(".//mxGraphModel")
            if model is None: continue
            
            elements = model.find("root")
            
            # 1. Map IDs
            id_map = {}
            for cell in elements:
                old_id = cell.get("id")
                if old_id in ["0", "1"]: continue
                
                # Check for client layer stuff and skip it
                val = str(cell.get("value", ""))
                style = str(cell.get("style", ""))
                # Skip existing client zones/items to avoid duplicates
                if "FanOps Web App" in val or "Client" in val or "zone_client" in old_id:
                    continue

                new_id = f"{prefix}_{old_id}"
                id_map[old_id] = new_id

            # 2. Copy Elements
            for cell in elements:
                old_id = cell.get("id")
                if old_id not in id_map: continue
                
                new_cell = ET.Element("mxCell")
                new_cell.attrib = cell.attrib.copy()
                new_cell.set("id", id_map[old_id])
                
                # Fix Parent
                old_parent = cell.get("parent")
                if old_parent == "1":
                    new_cell.set("parent", "1")
                elif old_parent in id_map:
                    new_cell.set("parent", id_map[old_parent])
                else:
                    new_cell.set("parent", "1") # Fallback to root if parent was skipped (e.g. client zone)

                # Fix Source/Target
                if "source" in new_cell.attrib:
                    s = new_cell.get("source")
                    if s in id_map: new_cell.set("source", id_map[s])
                if "target" in new_cell.attrib:
                    t = new_cell.get("target")
                    if t in id_map: new_cell.set("target", id_map[t])

                # Fix Geometry
                geo = cell.find("mxGeometry")
                if geo is not None:
                    new_geo = ET.Element("mxGeometry")
                    new_geo.attrib = geo.attrib.copy()
                    
                    # Shift X/Y only if parent is Root "1"
                    if new_cell.get("parent") == "1":
                        try:
                            x = float(new_geo.get("x", "0"))
                            y = float(new_geo.get("y", "0"))
                            new_geo.set("x", str(x + config["x"]))
                            new_geo.set("y", str(y + config["y"]))
                        except: pass
                    
                    # Copy points (for edges)
                    for point in geo:
                        new_geo.append(point)
                    
                    new_cell.append(new_geo)

                # Copy other styles
                for child in cell:
                    if child.tag != "mxGeometry":
                        new_cell.append(child)

                root_el_final.append(new_cell)

            # 3. Add Global Connections
            link_info = LINKS.get(prefix)
            if link_info:
                # To Client
                client_target_old = link_info["client_target"]
                if client_target_old in id_map:
                    c_edge = ET.Element("mxCell")
                    c_edge.set("id", f"link_client_{prefix}")
                    c_edge.set("parent", "1")
                    c_edge.set("source", "client_unified")
                    c_edge.set("target", id_map[client_target_old])
                    c_edge.set("edge", "1")
                    c_edge.set("style", "edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;strokeWidth=2;strokeColor=#333333;")
                    c_edge.set("value", "HTTPS Request")
                    geo = ET.Element("mxGeometry"); geo.set("relative", "1"); geo.set("as", "geometry")
                    c_edge.append(geo)
                    root_el_final.append(c_edge)

                # To Sentinel
                sentinel_src_old = link_info["sentinel_source"]
                if sentinel_src_old in id_map:
                    s_edge = ET.Element("mxCell")
                    s_edge.set("id", f"link_sentinel_{prefix}")
                    s_edge.set("parent", "1")
                    s_edge.set("source", id_map[sentinel_src_old])
                    s_edge.set("target", "sentinel_la_unified")
                    s_edge.set("edge", "1")
                    s_edge.set("style", "edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;strokeWidth=2;dashed=1;strokeColor=#FF3333;")
                    s_edge.set("value", "Log Ingestion")
                    geo = ET.Element("mxGeometry"); geo.set("relative", "1"); geo.set("as", "geometry")
                    s_edge.append(geo)
                    root_el_final.append(s_edge)

        except Exception as e:
            print(f"Error merging {prefix}: {e}")

    final_tree.write(OUTPUT_FILE, encoding="UTF-8", xml_declaration=True)
    print(f"Successfully generated {OUTPUT_FILE}")

if __name__ == "__main__":
    merge_files()
