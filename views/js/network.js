class Node {
    constructor(name, img, svg, nodeSvg) {
        console.log("Adding node constructor: " + name);
        this.name = name;
        
        const svgWidth = svg.getBBox().width  ;
        const svgHeight = svg.getBBox().height;
        
        this.xRaw = Math.random() * (svgWidth*0.8) + (svgWidth*0.1);
        this.yRaw = Math.random() * (svgHeight*0.8) + (svgHeight*0.1);
        console.log(`X: ${this.xRaw}, Y: ${this.yRaw}`);
        this.appearProgress = 0.0;
        
        this.svg = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
        this.fillSvg = document.createElementNS("http://www.w3.org/2000/svg", 'pattern');
        this.outerSvg = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
        
        this.appearStep = this.appearStep.bind(this);
        this.appear = this.appear.bind(this);
        
        this.appear(nodeSvg, img);
    }
    
    get x() {
        return Math.round(this.xRaw);
    }
    
    get y() {
        return Math.round(this.yRaw);
    }
    
    appearStep(svg) {
        if (this.appearProgress < 1) {
            this.appearProgress += 0.01;
            let y = this.appearProgress * (this.appearProgress - 2) * -1;
            
            this.svg.setAttribute("r", y*24);
            this.outerSvg.setAttribute("r", y*24);
        } else if(this.appearProgress < 2) {
            this.appearProgress += 0.01;

            let y = (this.appearProgress - 1) * (this.appearProgress - 3) * -1;
            let width = (1 - y); 
            
            this.outerSvg.setAttribute("r", 24 + y*10); 
            this.outerSvg.setAttribute("stroke-width", 5 * width);
        } else {
            svg.removeChild(this.outerSvg);
            
            // let x = this.x;
            // let y = this.y;
            
            /*
            let newTextElement = document.createElementNS("http://www.w3.org/2000/svg", 'text');
            newTextElement.innerHTML = name;
            newTextElement.setAttribute("id", "name-" + name);
            newTextElement.setAttribute("x", x-20);
            newTextElement.setAttribute("y", y-30);
            newTextElement.setAttribute("font-family", "sans-serif"); 
            newTextElement.setAttribute("font-size", 10); 
            //font-family="Verdana" font-size="35"
            svg.appendChild(newTextElement);
            console.log(`Name: ${name}, X: ${x}, Y: ${y}`);
            */
            return;
        }
        setTimeout(() => {this.appearStep(svg)}, 1);
    }
    
    appear(svg, img) {
        let defs = document.getElementsByTagNameNS("http://www.w3.org/2000/svg", "defs")[0];
        
        let patternName = `fill-${this.name}`
        this.fillSvg.setAttribute("id", patternName);
        this.fillSvg.setAttribute("patternUnits", "userSpaceOnUse");
        this.fillSvg.setAttribute("width", 48);
        this.fillSvg.setAttribute("height", 48);
        
        let imgSvg = document.createElementNS("http://www.w3.org/2000/svg", 'image');
        imgSvg.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', img)
        imgSvg.setAttribute("x", 0);
        imgSvg.setAttribute("y", 0);
        imgSvg.setAttribute("width", 48);
        imgSvg.setAttribute("height", 48);
        
        this.fillSvg.appendChild(imgSvg);
        defs.appendChild(this.fillSvg);
        
        this.svg.setAttribute("id", this.name);
        this.svg.setAttribute("r", 0);
        this.svg.setAttribute("cx", this.x);
        this.svg.setAttribute("cy", this.y);
        this.svg.setAttribute("stroke", "#f0f8ff");
        this.svg.setAttribute("stroke-width", 2);
        this.svg.setAttribute("fill", `url(#${patternName})`);
        svg.appendChild(this.svg);
        
        this.outerSvg.setAttribute("id", this.name + "-outer");
        this.outerSvg.setAttribute("cx",this.x); 
        this.outerSvg.setAttribute("cy",this.y); 
        this.outerSvg.setAttribute("r","0"); 
        this.outerSvg.setAttribute("stroke", "#f0f8ff");
        this.outerSvg.setAttribute("stroke-width", 5);
        this.outerSvg.style.fill = "none";
        svg.appendChild(this.outerSvg);
        
        this.appearStep(svg);
    }
}

class Edge {
    constructor(source, target, svg, edgeSvg) {
        this.source = source;
        this.target = target;
        this.surgeSvg = { // TODO: DO THIS FOR ALL CLASSES
            head: document.createElementNS("http://www.w3.org/2000/svg", 'circle'),
            body: document.createElementNS("http://www.w3.org/2000/svg", 'line')
        };
        this.linkSvg = document.createElementNS("http://www.w3.org/2000/svg", 'line');
        
        this.surgeStep = this.surgeStep.bind(this);
        this.surge = this.surge.bind(this);
        
        this.surgeProgress = 0.0;
        this.surge(edgeSvg);
    }
    
    surgeStep(sourceSvg, targetSvg, svg) {
        if (this.surgeProgress < 0.9) {
            this.surgeProgress += 0.005;
            
            const x1 = parseInt(sourceSvg.getAttribute("cx"));
            const y1 = parseInt(sourceSvg.getAttribute("cy"));
            const x2 = parseInt(targetSvg.getAttribute("cx"));
            const y2 = parseInt(targetSvg.getAttribute("cy"));
            
            const xdistance = x2 - x1;
            const ydistance = y2 - y1;
            
            const xprogress = xdistance * this.surgeProgress;
            const yprogress = ydistance * this.surgeProgress;
            
            const xlen = xdistance * 0.1;
            const ylen = ydistance * 0.1;
            
            const surgeBody = this.surgeSvg.body;
            surgeBody.setAttribute("x1", x1+xprogress);
            surgeBody.setAttribute("y1", y1+yprogress);
            surgeBody.setAttribute("x2", x1+xlen+xprogress);
            surgeBody.setAttribute("y2", y1+ylen+yprogress);
            surgeBody.setAttribute("stroke-width", (1 + this.surgeProgress*5));
            
            const surgeHead = this.surgeSvg.head;
            surgeHead.setAttribute("cx", x1+xlen+xprogress);
            surgeHead.setAttribute("cy", y1+ylen+yprogress);
            surgeHead.setAttribute("r", (3 + this.surgeProgress*3));
            
            // Link
             
             
            setTimeout(() => { this.surgeStep(sourceSvg, targetSvg, svg); }, 1);
        } else {
            this.surgeProgress = 1;
            svg.removeChild(this.surgeSvg.body);
            svg.removeChild(this.surgeSvg.head);
        }
    }
    
    surge(svg) {
        this.appearing = true;
        const surgeHead = this.surgeSvg.head;
        const surgeBody = this.surgeSvg.body;
        
        const sourceSvg = document.getElementById(this.source);
        const targetSvg = document.getElementById(this.target);
        
        const x1 = sourceSvg.getAttribute("cx");
        const y1 = sourceSvg.getAttribute("cy");
        const x2 = targetSvg.getAttribute("cx"); // TODO: REMOVE
        const y2 = targetSvg.getAttribute("cy"); // TODO: REMOVE
        
        const suffix = `${this.source}-${this.target}`;
        
        surgeHead.setAttribute("id", `surgeHead-${suffix}`);
        surgeHead.setAttribute("cx", x1);
        surgeHead.setAttribute("cy", y1);
        surgeHead.style.fill = "black";
        svg.appendChild(surgeHead);
        
        surgeBody.setAttribute("id", `surgeBody-${suffix}`);
        surgeBody.setAttribute("x1", x1);
        surgeBody.setAttribute("y1", y1);
        surgeBody.setAttribute("x2", x1);
        surgeBody.setAttribute("y2", y1);
        surgeBody.style.stroke = "black";
        svg.appendChild(surgeBody);
        
        
        const linkSvg = this.linkSvg;
        var linkSvgName = `link-${suffix}`;
        linkSvg.setAttribute("id", linkSvgName);
        linkSvg.setAttribute("x1", x1);
        linkSvg.setAttribute("y1", y1);
        linkSvg.setAttribute("x2", x1);
        linkSvg.setAttribute("y2", y1);
        linkSvg.setAttribute("stroke", "black");
        linkSvg.setAttribute("stroke-width", "2");
        svg.appendChild(linkSvg);
        
        this.surgeStep(sourceSvg, targetSvg, svg)
    }
}
    
class Graph {
    constructor(svg) {
        this.nodes = new Map();
        this.edges = new Map();
        this.appearingNodes = [];
        this.svg = svg;
        
        this.addNode = this.addNode.bind(this);
        this.addEdge = this.addEdge.bind(this);
        this.startForces = this.startForces.bind(this);
        this.applyForces = this.applyForces.bind(this);
        this.applyCoulombsLaw = this.applyCoulombsLaw.bind(this);
        this.applyHookesLaw = this.applyHookesLaw.bind(this);
        this.draw = this.draw.bind(this);
    }
    
    addNode(name, img) {
        let nodeSvg = document.getElementById("nodes");
        let node = new Node(name, img, this.svg, nodeSvg);
        this.nodes.set(name, node);
        this.edges.set(name, []);
    }
    
    addEdge(source, target) {
        let edgeSvg = document.getElementById("edges")
        let edge = new Edge(source, target, this.svg, edgeSvg);
        this.edges.get(source).push(edge);
    }
    
    startForces() {
        this.applyForces();
    }
    
    applyForces() {
        this.applyHookesLaw();
        this.applyCoulombsLaw();
        this.draw();
        setTimeout(this.applyForces, 10);
    }
    
    applyHookesLaw() {
        const springConstant = 0.02;
        const ideal = 100;
        const epsilon = 0.5;
        
        for (const edgeEntry of this.edges.entries()) {
            const sourceName = edgeEntry[0];
            const sourceNode = this.nodes.get(sourceName);
            const sourceEdges = edgeEntry[1];
            
            for (const edge of sourceEdges) {
                if (edge.surgeProgress < 1) {
                    continue;
                }
                
                const targetName = edge.target;
                const targetNode = this.nodes.get(targetName);
                
                let deltax = targetNode.xRaw - sourceNode.xRaw;
                let deltay = targetNode.yRaw - sourceNode.yRaw;
                  
                let distance = Math.sqrt(deltax*deltax + deltay*deltay);
                
                let unitx = deltax/distance;
                let unity = deltay/distance;
                
                let displacement = (distance - ideal);

                if (Math.abs(displacement) > epsilon) {
                    sourceNode.xRaw += springConstant*displacement*unitx;
                    sourceNode.yRaw += springConstant*displacement*unity;
                    targetNode.xRaw -= springConstant*displacement*unitx;
                    targetNode.yRaw -= springConstant*displacement*unity;
                }
                // console.log(`displacement of ${sourceName} and ${targetName} is ${displacement}\n Distance is ${distance}`);
            }
        }
    }
    
    applyCoulombsLaw() {
        const repulsionConstant = 2000.0;
        for (const nodeEntry of this.nodes.entries()) {
            const sourceNode = nodeEntry[1];
            
            for (const nodeEntry of this.nodes.entries()) {
                const targetNode = nodeEntry[1];
                
                if (sourceNode == targetNode) {
                    continue;
                }
                
                let deltax = targetNode.xRaw - sourceNode.xRaw;
                let deltay = targetNode.yRaw - sourceNode.yRaw;
                  
                let distance = Math.sqrt(deltax*deltax + deltay*deltay);
                let repulsion = repulsionConstant/(distance * distance);
                
                let unitx = deltax/distance;
                let unity = deltay/distance;
                  
                sourceNode.xRaw -= repulsion*unitx;
                sourceNode.yRaw -= repulsion*unity;
            }
        }
    }
    
    draw() {
        for (const nodeEntry of this.nodes.entries()) {
          const node = nodeEntry[1];
          const svg = node.svg;
          const fillSvg = node.fillSvg;
          
          if (svg == undefined) {
              continue;
          }
          
          fillSvg.setAttribute("x", node.x-24);
          fillSvg.setAttribute("y", node.y-24);
          svg.setAttribute("cx", node.x);
          svg.setAttribute("cy", node.y);
        }

        for (const edgeEntry of this.edges.entries()) {
            const sourceName = edgeEntry[0];
            const sourceNode = this.nodes.get(sourceName);
            const sourceEdges = edgeEntry[1];
            
            for (const edge of sourceEdges) {
                const targetName = edge.target;
                const targetNode = this.nodes.get(targetName);
                const linkSvg = edge.linkSvg;
                
                const xlength = targetNode.xRaw - sourceNode.xRaw;
                const ylength = targetNode.yRaw - sourceNode.yRaw;
                
                const x1 = sourceNode.xRaw;
                const y1 = sourceNode.yRaw;
                const x2 = x1 + xlength * edge.surgeProgress;
                const y2 = y1 + ylength * edge.surgeProgress;
                
                linkSvg.setAttribute("x1", Math.round(x1));
                linkSvg.setAttribute("y1", Math.round(y1));
                linkSvg.setAttribute("x2", Math.round(x2));
                linkSvg.setAttribute("y2", Math.round(y2));
            }
        }
    }
}