function textPath(x, y) {
    // Text should wrap around the top half of the node
    return `M ${x-30} ${y} A ${30} ${30} 0 0 1 ${x+30} ${y}`
}

// Return path instructions
function bezier(x1, y1, x2, y2) {
    let diffx = x2-x1;
    let diffy = y2-y1;
    let distance = Math.sqrt(diffx*diffx + diffy*diffy);
    
    let unitx = 0;
    let unity = 0;
    
    if (distance > 0) {
        unitx = diffx/distance;
        unity = diffy/distance;
    }
    
    // Want the anchors to be 10 degrees off the direct path
    let theta1 = Math.PI * (10.0/180.0);
    let theta2 = Math.PI * (170.0/180.0);
  
    // Path starts 40px off center
    let newx1 = x1 + Math.cos(theta1)*unitx*40 - Math.sin(theta1)*unity*40;
    let newy1 = y1 + Math.sin(theta1)*unitx*40 + Math.cos(theta1)*unity*40;
    // Path ends 60px off center, to  leave room for the arrowhead
    let newx2 = x2 + Math.cos(theta2)*unitx*60 - Math.sin(theta2)*unity*60;
    let newy2 = y2 + Math.sin(theta2)*unitx*60 + Math.cos(theta2)*unity*60;
    
    // Set anchor points
    let anchor1x = newx1 + Math.cos(theta1)*unitx*(distance-100)/3 - Math.sin(theta1)*unity*(distance-100)/3;
    let anchor1y = newy1 + Math.sin(theta1)*unitx*(distance-100)/3 + Math.cos(theta1)*unity*(distance-100)/3;
    let anchor2x = newx2 + Math.cos(theta2)*unitx*(distance-100)/3 - Math.sin(theta2)*unity*(distance-100)/3;
    let anchor2y = newy2 + Math.sin(theta2)*unitx*(distance-100)/3 + Math.cos(theta2)*unity*(distance-100)/3;

    // Get coordinate strings
    let coords1 = `${Math.round(newx1)} ${Math.round(newy1)}`;
    let coords2 = `${Math.round(anchor1x)} ${Math.round(anchor1y)}`;
    let coords3 = `${Math.round(anchor2x)} ${Math.round(anchor2y)}`;
    let coords4 = `${Math.round(newx2)} ${Math.round(newy2)}`;
    
    // Path instructions
    return `M${coords1} C ${coords2}, ${coords3}, ${coords4}`
}

class Node {
    constructor(name, img, svg, nodeSvg) {
        // We want the bigger image for user highlighting... todo
        img = img.replace("normal", "bigger");
        
        // Keep original username capitalization and lowercase username
        // User input may not match original username
        this.rawName = name;
        this.name = name.toLowerCase();
        
        // Keep the svg height and width
        const svgWidth = svg.getBBox().width;
        const svgHeight = svg.getBBox().height;
        
        // Place node in middle 80% of screen
        this.x = Math.random() * (svgWidth*0.8) + (svgWidth*0.1);
        this.y = Math.random() * (svgHeight*0.8) + (svgHeight*0.1);
        
        // Store progress of appearance animation
        this.appearProgress = 0.0;
        
        // Main circle element
        this.svg = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
        // Path for label text element
        this.textPathSvg = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        // Pattern for user image to fill main circle
        this.fillSvg = document.createElementNS("http://www.w3.org/2000/svg", 'pattern');
        // Fancy circle for appearance animation
        this.outerSvg = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
        
        this.appearStep = this.appearStep.bind(this);
        this.appear = this.appear.bind(this);
        
        // Cue appearance animation
        this.appear(nodeSvg, img);
    }
    
    appearStep(svg) {
        // For first part of animation, grow the main circle
        if (this.appearProgress < 1) {
            this.appearProgress += 0.05;
            // Ease
            let y = this.appearProgress * (this.appearProgress - 2) * -1;
            
            // Get the circle to eventually have radius of 24
            this.svg.setAttribute("r", y*24);
            this.outerSvg.setAttribute("r", y*24);
            
            // Second part of animation, make the outer circle grow and thin out
        } else if(this.appearProgress < 2) {
            this.appearProgress += 0.01;

            let y = (this.appearProgress - 1) * (this.appearProgress - 3) * -1;
            let width = (1 - y); 
            
            // Growth
            this.outerSvg.setAttribute("r", 24 + y*10); 
            // Thin
            this.outerSvg.setAttribute("stroke-width", 5 * width);
            
            // When the outer circle dissappears, remove it from outer SVG group
        } else {
            svg.removeChild(this.outerSvg);
            return;
        }
        
        // Repeat step if appearance isn't complete
        window.requestAnimationFrame(() => {this.appearStep(svg)});
    }
    
    appear(svg, img) {
        // Find defs tag
        const defs = document.getElementsByTagNameNS("http://www.w3.org/2000/svg", "defs")[0];
        
        const patternName = `fill-${this.name}`
        // Set pattern attributes
        this.fillSvg.setAttribute("id", patternName);
        this.fillSvg.setAttribute("patternUnits", "userSpaceOnUse");
        this.fillSvg.setAttribute("width", 48);
        this.fillSvg.setAttribute("height", 48);
        
        const imgSvg = document.createElementNS("http://www.w3.org/2000/svg", 'image');
        // Set image attributes
        imgSvg.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', img)
        imgSvg.setAttribute("x", 0);
        imgSvg.setAttribute("y", 0);
        imgSvg.setAttribute("width", 48);
        imgSvg.setAttribute("height", 48);
        
        // Add image to pattern
        this.fillSvg.appendChild(imgSvg);
        // Add pattern to defs
        defs.appendChild(this.fillSvg);
        
        // Set main circle attributes
        this.svg.setAttribute("id", this.name);
        this.svg.setAttribute("r", 0);
        this.svg.setAttribute("cx", Math.round(this.x));
        this.svg.setAttribute("cy", Math.round(this.y));
        this.svg.setAttribute("stroke", "#f0f8ff");
        this.svg.setAttribute("stroke-width", 2);
        this.svg.setAttribute("fill", `url(#${patternName})`);
        svg.appendChild(this.svg);
        
        // Set outer circle attributes
        this.outerSvg.setAttribute("id", this.name + "-outer");
        this.outerSvg.setAttribute("cx", Math.round(this.x)); 
        this.outerSvg.setAttribute("cy", Math.round(this.y)); 
        this.outerSvg.setAttribute("r","0"); 
        this.outerSvg.setAttribute("stroke", "#f0f8ff");
        this.outerSvg.setAttribute("stroke-width", 5);
        this.outerSvg.style.fill = "none";
        svg.appendChild(this.outerSvg);
        
        // Set path for the label text
        this.textPathSvg.setAttribute("id", this.name + "-textPath");
        this.textPathSvg.setAttribute("d", textPath(this.x, this.y));
        
        // Add path to defs
        defs.appendChild(this.textPathSvg);
        
        const textContentSvg = document.createElementNS("http://www.w3.org/2000/svg", 'textPath');
        // Create the textPath svg element that has the text content and links to the path
        textContentSvg.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', `#${this.name}-textPath`);
        textContentSvg.innerHTML = "@" + this.rawName;
        
        const textSvg = document.createElementNS("http://www.w3.org/2000/svg", 'text');
        // Set text attributes
        textSvg.setAttribute("font-family", "sans-serif");
        textSvg.setAttribute("font-size", "9");
        textSvg.style.textShadow = "-1px -1px 0 white, 1px 1px 0 white, -1px 1px 0 white, 1px -1px 0 white";
        textSvg.appendChild(textContentSvg);
        
        svg.appendChild(textSvg);
        
        this.appearStep(svg);
    }
}

class Edge {
    constructor(source, target, svg, edgeSvg) {
        // Keep names lowercased
        this.source = source.toLowerCase();
        this.target = target.toLowerCase();
        this.linkSvg = document.createElementNS("http://www.w3.org/2000/svg", 'path');
        
        this.surgeStep = this.surgeStep.bind(this);
        this.surge = this.surge.bind(this);
        
        // Track progress for initial surge animation
        this.surgeProgress = 0.0;
        this.surge(edgeSvg);
    }
    
    surgeStep(sourceSvg, targetSvg, svg) {
        if (this.surgeProgress < 1) {
            this.surgeProgress += 0.01;
            
            const linkSvg = this.linkSvg;
            // Show little bit more of the path
            linkSvg.setAttribute("stroke-dashoffset", `${(1-this.surgeProgress)*100}%`);
             
            window.requestAnimationFrame(() => { this.surgeStep(sourceSvg, targetSvg, svg); });
        } 
    }
    
    surge(svg) {
        // Since we only store names of nodes, get the svg elements for them
        const sourceSvg = document.getElementById(this.source);
        const targetSvg = document.getElementById(this.target);
        
        // Get coordinates
        const x1 = parseInt(sourceSvg.getAttribute("cx"));
        const y1 = parseInt(sourceSvg.getAttribute("cy"));
        const x2 = parseInt(targetSvg.getAttribute("cx")); 
        const y2 = parseInt(targetSvg.getAttribute("cy")); 
        
        const suffix = `${this.source}-${this.target}`;
        
        const linkSvg = this.linkSvg;
        // Set Attributes for path
        const linkSvgName = `link-${suffix}`;
        linkSvg.setAttribute("id", linkSvgName);
        // Path instructions
        linkSvg.setAttribute("d", bezier(x1,y1,x2,y2));
        linkSvg.setAttribute("stroke", "black");
        linkSvg.setAttribute("stroke-width", "2");
        linkSvg.setAttribute("fill", "transparent");
        // Set up animation
        linkSvg.setAttribute("stroke-dasharray", "100% 100%");
        linkSvg.setAttribute("stroke-dashoffset", "100%");
        // Arrowhead
        linkSvg.setAttribute("marker-end", "url(#arrowhead)");
        svg.appendChild(linkSvg);
        
        this.surgeStep(sourceSvg, targetSvg, svg)
    }
}
    
class Graph {
    constructor(svg) {
        this.nodes = new Map();
        this.edges = new Map();
        this.svg = svg;
        
        this.width = svg.getBBox().width;
        this.height = svg.getBBox().height;
        
        /*-----Configs-----*/
        // circle or force
        this.graphMode = null;
        // how fast nodes rotate around center
        this.circleDrift = Math.PI/9000;
        this.circleOffset = 0;
        // repulsions between nodes
        this.nodeRepulsionConstant = 50000.0;
        // repulsion between node and wall
        this.wallRepulsionConstant = 5000.0;
        // spring force on edges/links/target positions
        this.springConstant = 0.01;
        // Ideal edge length
        this.springLength = null;
        
        this.addNode = this.addNode.bind(this);
        this.addEdge = this.addEdge.bind(this);
        
        
        this.startCircle = this.startCircle.bind(this);
        this.applyCircle = this.applyCircle.bind(this);
        this.startForces = this.startForces.bind(this);
        this.applyForces = this.applyForces.bind(this);
        
        this.applyCoulombsLaw = this.applyCoulombsLaw.bind(this);
        this.applyHookesLaw = this.applyHookesLaw.bind(this);
        this.draw = this.draw.bind(this);
    }
    
    addNode(name, img) {
        let nodeSvg = document.getElementById("nodes");
        let node = new Node(name, img, this.svg, nodeSvg);
        // Lowercase because user input may not match actual username
        this.nodes.set(name.toLowerCase(), node);
        this.edges.set(name.toLowerCase(), []);
    }
    
    addEdge(source, target) {
        let edgeSvg = document.getElementById("edges")
        let edge = new Edge(source, target, this.svg, edgeSvg);
        // Lowercase because user input may not match actual username
        this.edges.get(source.toLowerCase()).push(edge);
    }
    
    startCircle() {
        this.graphMode = "circle";
        this.applyCircle();
    }
    
    applyCircle() {
        const springConstant = this.springConstant;
        // ideal distance between node and target position is 0
        const ideal = 0;
        const epsilon = 0.5;
        
        if (this.graphMode == "circle") {
            let radius = (Math.min(this.height, this.width) - 100)/2;
            let midHeight = this.height/2;
            let midWidth = this.width/2;
            let sections = this.nodes.size;
            let section = 0;
            
            // Give each node a  targetspace on the circle so that they
            // will be evenly spaced out.
            for (const nodeEntry of this.nodes.entries()) {
              const node = nodeEntry[1];
              
              let targetx = midWidth + radius*Math.cos(2*Math.PI*(section/sections) + this.circleOffset);
              let targety = midHeight + radius*Math.sin(2*Math.PI*(section/sections) + this.circleOffset);
              
              let deltax = targetx - node.x;
              let deltay = targety - node.y;
                
              let distance = Math.sqrt(deltax*deltax + deltay*deltay);
              
              let unitx = deltax/distance;
              let unity = deltay/distance;
              
              let displacement = (distance - ideal);
  
              if (Math.abs(displacement) > epsilon) {
                  node.x += springConstant*displacement*unitx;
                  node.y += springConstant*displacement*unity;
              }
              
              section++;
            }
            
            // Add to offset
            this.circleOffset += this.circleDrift;
            this.draw();
            window.requestAnimationFrame(this.applyCircle);
        }
    }
    
    startForces() {
        this.graphMode = "force";
        this.applyForces();
    }
    
    applyForces() {
        if (this.graphMode == "force") {
            // Spring forces on edges
            this.applyHookesLaw();
            // Repulsion
            this.applyCoulombsLaw();
            this.draw();
            window.requestAnimationFrame(this.applyForces);
        }
    }
    
    applyHookesLaw() {
        const springConstant = this.springConstant;
        // Experimented to get this value. We want the ideal distance between
        // nodes to decrease as we add more nodes to the graph. Open to changing this
        // value or setting it to be configurable.
        const ideal = this.springLength || Math.max(this.width, this.height) * (1.0/Math.log2(this.nodes.size));
        const epsilon = 0.5;
        
        for (const edgeEntry of this.edges.entries()) {
            const sourceName = edgeEntry[0];
            const sourceNode = this.nodes.get(sourceName);
            const sourceEdges = edgeEntry[1];
            
            for (const edge of sourceEdges) {
                // Don't use spring forces until the edge is sufficiently drawn
                if (edge.surgeProgress < 0.75) {
                    continue;
                }
                
                const targetName = edge.target;
                const targetNode = this.nodes.get(targetName);
                
                let deltax = targetNode.x - sourceNode.x;
                let deltay = targetNode.y - sourceNode.y;
                  
                let distance = Math.sqrt(deltax*deltax + deltay*deltay);
                
                let unitx = deltax/distance;
                let unity = deltay/distance;
                
                let displacement = (distance - ideal);

                if (Math.abs(displacement) > epsilon) {
                    sourceNode.x += springConstant*displacement*unitx;
                    sourceNode.y += springConstant*displacement*unity;
                    targetNode.x -= springConstant*displacement*unitx;
                    targetNode.y -= springConstant*displacement*unity;
                }
            }
        }
    }
    
    applyCoulombsLaw() {
        const nodeRepulsionConstant = this.nodeRepulsionConstant;
        const wallRepulsionConstant = this.wallRepulsionConstant;
        
        for (const nodeEntry of this.nodes.entries()) {
            const sourceNode = nodeEntry[1];
            
            // Between nodes
            for (const nodeEntry of this.nodes.entries()) {
                const targetNode = nodeEntry[1];
                
                if (sourceNode == targetNode) {
                    continue;
                }
                
                let deltax = targetNode.x - sourceNode.x;
                let deltay = targetNode.y - sourceNode.y;
                  
                let distance = Math.sqrt(deltax*deltax + deltay*deltay);
                let repulsion = nodeRepulsionConstant/(distance * distance);
                
                let unitx = deltax/distance;
                let unity = deltay/distance;
                  
                sourceNode.x -= repulsion*unitx;
                sourceNode.y -= repulsion*unity;
            }
            
            // Between node and wall
            // Top and Left walls
            let deltax = 0 - sourceNode.x;
            let deltay = 0 - sourceNode.y;
              
            sourceNode.x += wallRepulsionConstant/(deltax*deltax);
            sourceNode.y += wallRepulsionConstant/(deltay*deltay);
            
            // Bottom and Right walls
            deltax = this.width - sourceNode.x;
            deltay = this.height - sourceNode.y;
              
            sourceNode.x -= wallRepulsionConstant/(deltax*deltax);
            sourceNode.y -= wallRepulsionConstant/(deltay*deltay);
        }
    }
    
    draw() {
        for (const nodeEntry of this.nodes.entries()) {
          const node = nodeEntry[1];
          const svg = node.svg;
          const fillSvg = node.fillSvg;
          const textPathSvg = node.textPathSvg;
          
          if (svg == undefined) {
              continue;
          }
          
          textPathSvg.setAttribute("d", textPath(node.x, node.y));
          fillSvg.setAttribute("x", Math.round(node.x-24));
          fillSvg.setAttribute("y", Math.round(node.y-24));
          svg.setAttribute("cx", Math.round(node.x));
          svg.setAttribute("cy", Math.round(node.y));
        }

        for (const edgeEntry of this.edges.entries()) {
            const sourceName = edgeEntry[0];
            const sourceNode = this.nodes.get(sourceName);
            const sourceEdges = edgeEntry[1];
            
            for (const edge of sourceEdges) {
                const targetName = edge.target;
                const targetNode = this.nodes.get(targetName);
                const linkSvg = edge.linkSvg;
                
                const x1 = sourceNode.x;
                const y1 = sourceNode.y;
                const x2 = targetNode.x;
                const y2 = targetNode.y;
                
                linkSvg.setAttribute("d", bezier(x1,y1,x2,y2));
            }
        }
    }
}