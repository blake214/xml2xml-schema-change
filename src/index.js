const xml2js = require('xml2js');
const saxon = require('saxon-js');
const libxmljs = require('libxmljs');

class xmlNode {
    constructor(name = null, type = null){
        /*
        xmlNode is an instance used for createing nodes in an xml tree structure
        Usage: new xmlNode(name, type)
        Parameters:
            - name (string): A name for the node.
            - type (string): A type of a node.
        Returns:
            - Nothing
        */
        if(name) this.set_name(name)
        else this.name = name
        if(type) this.set_type(type)
        else this.type = type
        this.sources = []
        this.children = []
    }
    static validate_xmlNode_syntax(xslt_node){
        /*
        This function validates the input is a xmlNode and is valid syntax
        Usage: validate_xmlNode_syntax(xslt_node)
        Parameters:
            - xslt_node (xmlNode instance): The instance of a xmlNode.
        Returns:
            - boolean: True if valid and throws error if not valid
        */
        // Validate node is indeed a xslt node
        if(xslt_node instanceof xmlNode) return true
        throw new Error("The parsed element not an xslt node")
    }
    set_name(name){
        /*
        This function sets the xmlNode name
        Usage: set_name(name)
        Parameters:
            - name (string): The name of the node.
        Returns:
            - Nothing
        */
        // Validate name is of a valid form, being an xml valid name
        if(typeof(name) == 'string' && /^[A-Za-z_]*$/.test(name)) return this.name = name
        throw new Error("Name is invalid, should contain characters and underscores only") 
    }
    set_type(type){
        /*
        This function sets the xmlNode type
        Usage: set_type(type)
        Parameters:
            - type (string): The type of the node.
                ['xs:string', 'xs:integer', ...]
        Returns:
            - Nothing
        */
        // Validate type is of type string
        if(typeof(type) == 'string') return this.type = type
        throw new Error("Type is invalid, should be a string") 
    }
    set_sources(sources){
        /*
        This function sets the xmlNode sources from the source xml
        Usage: set_sources(sources)
        Parameters:
            - sources (array-like(string)): An array of XPath strings.
        Returns:
            - Nothing
        */
        // Validate sources are of type array and strings
        if(Array.isArray(sources)) {
            sources.forEach(element => {
                if(typeof(element) !== 'string') throw new Error("Sources must be an array of strings")
            });
            return this.sources = sources
        }
        throw new Error("Sources must be an array of strings")
    }
    add_child(child_node){
        /*
        This function adds a child xmlNode, treating this xmlNode as a root node
        Usage: add_child(child_node)
        Parameters:
            - child_node (xmlNode): An instance of a xmlNode.
        Returns:
            - Nothing
        */
        // Validate node is a xslt node
        if(xmlNode.validate_xmlNode_syntax(child_node)) return this.children.push(child_node)
        throw new Error("The parsed child node isnt valid")
    }
}

class xsltSchema {
    constructor(xsd_source, xsd_target, mapping_object){
        /*
        xsltSchema is an instance used for transforming between xml schemas
        Usage: new xsltSchema(xsd_source, xsd_target, mapping_object)
        Parameters:
            - xsd_source (string): A xsd string.
            - xsd_target (string): A xsd string.
            - mapping_object (array-like(object)): An array of objects indicating the mapping between xsd.
                - Taking the form -> [
                    {
                        "target": "root", => string of the xsd_target element
                        "sources": ["Xpath"] => array of Xpath strings from the xsd_source
                    }
                ]
        Returns:
            - Nothing
        */
        if(xsltSchema.validate_xsd_syntax(xsd_source)) this.xsd_source = xsd_source
        else throw new Error("xsd_source isnt valid")
        if(xsltSchema.validate_xsd_syntax(xsd_target)) this.xsd_target = xsd_target
        else throw new Error("xsd_target isnt valid")
        if(xsltSchema.validate_mapping_syntax(mapping_object)) this.mapping_object = mapping_object
        else throw new Error("mapping_object isnt valid")

        // Initialise the object that will hold the non mapped data
        this.non_mapped

        // Validate the mapping object
        if(!this.validate_mapping()) throw new Error("The mapping object isnt valid against the target and source XSD's")
    }
    async init() {
        /*
        This is a async function that finalises the creation of the xsltSchema instance, by creating the node tree and xslt
        Usage: init()
        Parameters:
            - Nothing
        Returns:
            - Nothing
        */
        // Create clean node tree
        const node_tree_structure= await xsltSchema.create_node_tree(this.xsd_target, this.mapping_object)
        this.node_tree = node_tree_structure[0]
        // Record the non_mapped
        this.non_mapped = node_tree_structure[1]
        // Create xslt instance
        this.create_xslt()
    }
    static validate_xsd_syntax(xsd_string) {
        /*
        This function validates the XSD is of a valid syntax
        Usage: validate_xsd_syntax(xsd_string)
        Parameters:
            - xsd_string (string): A XSD / XML string.
        Returns:
            - boolean: True if valid and throws error if not valid
        */
        // Validates a parameters was given
        if(!xsd_string) throw new Error("XSD string required")
        // Validate the parameters is valid
        try {
            libxmljs.parseXml(xsd_string)
            return true
        } catch (error) {
            throw new Error("XSD not valid")
        }
    }
    static validate_mapping_syntax(mapping_json) {
        /*
        This function validates the mapping object is of a valid syntax
        Usage: validate_mapping_syntax(mapping_json)
        Parameters:
            - mapping_json (object): A mapping object.
        Returns:
            - boolean: True if valid and throws error if not valid
        */
        if(!mapping_json) throw new Error("Mapping object required")
        return true
    }
    validate_mapping() {
        /*
        This function validates the mapping object is valid against the source and target XSD
        Usage: validate_mapping()
        Parameters:
            - None
        Returns:
            - boolean: True if valid and throws error if not valid
        */
        // Check mapping is valid structure
        if(!Array.isArray(this.mapping_object)) throw new Error("Mapping incorrect syntax")
        this.mapping_object.forEach(element => {
            if(!('target' in element)) throw new Error("Mapping incorrect syntax")
            if(!('sources' in element)) throw new Error("Mapping incorrect syntax")
            if(!Array.isArray(element.sources)) throw new Error("Mapping incorrect syntax")
            element.sources.forEach(element => {
                if(typeof(element) != 'string') throw new Error("Mapping incorrect syntax")
            });
        });
        return true
    }
    static create_node_tree_structure(element, mapping, non_mapped = [], root_node = new xmlNode()) {
        /*
        This is a recursion function that recursively creates tree nodes from xml2js format
        Usage: create_node_tree_structure(element, mapping, root_node)
        Parameters:
            - element (object): A xml2js node.
            - mapping (object): A mapping object for reference.
            - root_node (object): A xmlNode object to edit.
        Returns:
            - object: of the form -> {
                node: xmlNode,
                parent_type: "" -> the type of the parent of this node, in string form
                non_mapped: [] -> an array of elements that havent been mapped from the target_xsd
            }
        */
        let parent_node_type = 'object'
        let root_node_mapped = true
        Object.keys(element).forEach(key => {
            if(key == '$'){
                // If the node has a name (is an element)
                if('name' in element[key]){
                    root_node.set_name(element[key]['name'])
                    let mapper_found = false
                    // Searching the mapping object to find a mapped element
                    mapping.forEach(mapper => {
                        if(element[key]['name'] == mapper.target){
                            root_node.set_sources(mapper.sources)
                            mapper_found = true
                        }
                    })
                    // Here we record if there is no mapping
                    if(!mapper_found) {
                        if(!non_mapped.includes(element[key]['name'])) non_mapped.push(element[key]['name'])
                    }
                    root_node_mapped = mapper_found
                    // If the node is a end node
                    if('type' in element[key]){
                        root_node.set_type(element[key]['type'])
                    }
                    // Changing the parent of the root_node to be an array
                    if('maxOccurs' in element[key]){
                        parent_node_type = 'array'
                    }
                }
            } else if(key == 'xs:element'){
                element[key].forEach(element_tag => {
                    let new_node = new xmlNode()
                    let child_node = this.create_node_tree_structure(element_tag, mapping, non_mapped, new_node)
                    // If the node isnt the last node of the tree
                    if(child_node.node) {
                        root_node.set_type(child_node.parent_type)
                        root_node.add_child(child_node.node)
                    }
                    child_node.non_mapped.forEach(element => {
                        if(!non_mapped.includes(element)) non_mapped.push(element)
                    });
                });
            } else {
                if(element[key].length){
                    element[key].forEach(element_tag => {
                        // There should only be one element if not an 'element' tag
                        let node = this.create_node_tree_structure(element_tag, mapping, non_mapped, root_node)
                        root_node = node.node
                        node.non_mapped.forEach(element => {
                            if(!non_mapped.includes(element)) non_mapped.push(element)
                        });
                    });
                } else {
                    // This directly for the first 'schema' node
                    let node = this.create_node_tree_structure(element[key], mapping, non_mapped, root_node)
                    root_node = node.node
                    node.non_mapped.forEach(element => {
                        if(!non_mapped.includes(element)) non_mapped.push(element)
                    });
                }
            }
        });
        // Checking if there is a mapping for the node, else we will leave it out
        if(root_node_mapped) return {
            node: root_node,
            parent_type: parent_node_type,
            non_mapped: non_mapped
        }
        return {
            node: root_node_mapped,
            non_mapped: non_mapped
        }
    }
    static async create_node_tree(xml_string, mapping_object) {
        /*
        This function creates the raw node tree / structure, inclusive of all nodes
        Usage: create_node_tree()
        Parameters:
            - xml_string (string): A xml string.
        Returns:
            - Raw_node_tree (object): Object of a raw node tree structure
        */
        return new Promise((resolve, reject) => {
            xml2js.parseString(xml_string, (err, result) => {
                if (err) reject(err)
                else {
                    const node_tree_structure = xsltSchema.create_node_tree_structure(result, mapping_object)
                    const raw_node_tree = node_tree_structure.node;
                    const non_mapped = node_tree_structure.non_mapped
                    const clean_node_tree = xsltSchema.clean_node_tree(raw_node_tree);
                    resolve([clean_node_tree, non_mapped])
                }
            });
        })
    }
    static clean_node_tree(raw_node_tree) {
        /*
        This function cleans the raw node tree, removing irrelivant nodes
        Usage: clean_node_tree()
        Parameters:
            - Raw_node_tree (object): A Raw_node_tree object.
        Returns:
            - Node_tree (object): Object of a clean node tree structure
        */
        // Clean raw node tree and return
        if(!raw_node_tree) return
        // Here we are removing nodes / skipping a node that doesnt have a name
        if(!raw_node_tree.name)return xsltSchema.clean_node_tree(raw_node_tree.children[0])
        const cleaned_node_tree = {
            ...raw_node_tree,
            children: []
        };
        for (let index = 0; index < raw_node_tree.children.length; index++) {
            const cleaned_child = xsltSchema.clean_node_tree(raw_node_tree.children[index]);
            if (cleaned_child) cleaned_node_tree.children.push(cleaned_child);
        }
        return cleaned_node_tree
    }
    create_xslt() {
        /*
        This function utilises the mapping and target xsd to create a XSLT for conversions
        Usage: create_xslt()
        Parameters:
            - None
        Returns:
            - None
        */
        // Create xslt
        let xslt = `<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="2.0">`
        xslt += `<xsl:output indent="yes" method="xml"/>`
        xslt += `<xsl:template match="/"><xsl:call-template name="${this.node_tree.name}"/></xsl:template>`
        xslt += xsltSchema.create_xslt_structure("", "name", this.node_tree.name, this.node_tree, "")
        xslt += `</xsl:stylesheet>`
        // Assign xslt to this object
        this.xslt = xslt
    }
    static create_xslt_structure(current_xslt, xslt_node_type, xslt_node_type_content, current_node, current_node_path) {
        /*
        This is a recursion function that recursively takes nested xml snippets and transforms them to relevant XSLT snippets
        Usage: create_xslt_structure(current_xslt, xslt_node_type, xslt_node_type_content, current_node, current_node_path)
        Parameters:
            - current_xslt (string): A string of the current xslt to append snippet too.
            - xslt_node_type (string): A string stating the type of the xslt node, eg 'name' or 'select'.
            - xslt_node_type_content (string): A string of the content for the node type, basically the name of the template.
            - current_node (Node tree): A clean node tree object.
            - current_node_path (string): The current path of the node tree, right bock to the root node.
        Returns:
            - String: the current_xslt ammended with the current node
        */
        // Checking if this is the beginning of the nodes path
        if(current_node_path.length != 0) current_node_path += `_${current_node.name}`
        else current_node_path += `${current_node.name}`
        
        let source = null

        // Creating the template per its type
        if(xslt_node_type == 'select') current_xslt += `<xsl:template match="${xslt_node_type_content}">`
        else current_xslt += `<xsl:template ${xslt_node_type}="${xslt_node_type_content}">`
        current_xslt += `<${current_node.name}>`

        if(current_node.type == "array") {
            // Creating concatenation of sources for the template
            current_node.sources.forEach(node_source => {
                if(source) source += ` | ${node_source}`
                else source = `${node_source}`
            });
            current_xslt += `<xsl:apply-templates select="${source}"/>`
        } else if(current_node.type == "object") {
            // Creating an template call instance per each 'element'
            current_node.children.forEach(child_node => {
                current_xslt += `<xsl:call-template name="${current_node_path}_${child_node.name}"/>`
            });
        } else {
            let concat_source = null
            // Creating calling functions for the template if they are not objects
            current_node.sources.forEach(node_source => {
                if(concat_source) concat_source += ` | ${node_source}`
                else concat_source = `${node_source}`
            });
            if((current_node.type == "xs:string") && (current_node.sources.length > 1)) current_xslt += `<xsl:apply-templates select="${concat_source}" mode="combine"/>`
            else current_xslt += `<xsl:apply-templates select="${concat_source}"/>`
        }

        current_xslt += `</${current_node.name}>`
        current_xslt += `</xsl:template>`

        if(current_node.type == "array") {
            // Call this on the children templates of the root template
            current_xslt += xsltSchema.create_xslt_structure("", "select", source, current_node.children[0], current_node_path)
        } else if(current_node.type == "object") {
            current_node.children.forEach(child_node => {
                current_xslt += xsltSchema.create_xslt_structure("", "name", `${current_node_path}_${child_node.name}`, child_node, current_node_path)
            });
        }
        return current_xslt
    }
}

class xsltTransformer {
    constructor(xsltSchema_serialised){
        /*
        xsltTransformer is an instance used for transforming between xml schemas
        Usage: new xsltTransformer(xsltSchema_serialised)
        Parameters:
            - xsltSchema_serialised (object): A serialised xsltSchema instance.
        Returns:
            - Nothing
        */
        const xsltSchema_deserialised = xsltTransformer.xsltSchema_deserialise(xsltSchema_serialised)
        if(xsltSchema_deserialised.xsd_target) this.xsd_target = xsltSchema_deserialised.xsd_target
        else throw new Error("xsltSchema isnt well formed")
        if(xsltSchema_deserialised.xsd_source) this.xsd_source = xsltSchema_deserialised.xsd_source
        else throw new Error("xsltSchema isnt well formed")
        if(xsltSchema_deserialised.xslt) this.xslt = xsltSchema_deserialised.xslt
        else throw new Error("xsltSchema isnt well formed")
    }
    static xsltSchema_deserialise(xsltSchema_serialised) {
        /*
        This function deserialises a xsltSchema serialised instance, and returns nessesary elements
        Usage: xsltSchema_deserialise()
        Parameters:
            - Nothing
        Returns:
            - Nothing
        */
        // Deserialise the instance
        try {
            return JSON.parse(xsltSchema_serialised)
        } catch(error) {
            throw new Error("Serialised xsltSchema isnt deserialisable")
        }
    }
    transform(xml_source) {
        /*
        This function transforms a xml source to another xml using the xsltSchema instance. Performing validations on the xml source and targets also
        Usage: transform_xml(xml_source, xsltSchema=null, xslt=null)
        Parameters:
            - xml_source (string): A string of an xml.
        Returns:
            - String: the transformed xml
        */
        // Validating the xml source that its wellformed as well as valid against the source schema
        if(!xsltTransformer.validate_xml_syntax(xml_source)) throw new Error("XML isnt valid syntax")
        if(!xsltTransformer.validate_xml_schema(xml_source, this.xsd_source)) throw new Error("Source XML isnt valid against schema")
        // 
        const env = saxon.getPlatform(); 
        const doc = env.parseXmlFromString(this.xslt);
        doc._saxonBaseUri = "some_path"; // This is for the relative path, it needs to be assigned but dont think it gets used
        const sef = saxon.compile(doc);
        // Return a promise to transform
        return new Promise((resolve, reject) => {
            saxon.transform({
                stylesheetInternal: sef,
                sourceType: "xml",
                sourceText: xml_source,
                destination: "serialized"}, 
                "async"
            ).then(result => {
                if (result.exceptionOccurred) reject(result.exception)
                else {
                    if(!xsltTransformer.validate_xml_syntax(result.principalResult)) throw new Error("Returned XML isnt valid syntax")
                    if(!xsltTransformer.validate_xml_schema(result.principalResult, this.xsd_target)) throw new Error("Returned XML isnt valid against schema")
                    resolve(result.principalResult)
                }
            })
        })
    }
    static validate_xml_syntax(xml_string) {
        /*
        This function validates an xml is of valid syntax
        Usage: validate_xml_syntax(xml_string)
        Parameters:
            - xml_string (string): A string of an xml.
        Returns:
            - Boolean: true if valid, and false if not
        */
        try {
            libxmljs.parseXml(xml_string);
            return true
        } catch(error) {
            return false
        }
    }
    static validate_xml_schema(xml_string, xsd_string) {
        /*
        This function validates an xml against an xsd schema
        Usage: validate_xml_schema(xml_string, xsd_string)
        Parameters:
            - xml_string (string): A string of an xml.
            - xsd_string (string): A string of an xsd.
        Returns:
            - Boolean: true if valid, and false if not
        */
        try {
            const xsd_validate_doc = libxmljs.parseXml(xsd_string);
            const xml_validate_doc = libxmljs.parseXml(xml_string);
            const validation_result = xml_validate_doc.validate(xsd_validate_doc);
            if(validation_result) return true
            return false
        } catch(error) {
            return false
        }
    }
}

module.exports = { xmlNode, xsltSchema, xsltTransformer };
