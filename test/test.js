console.log("================ Begin Test...")
const utils = require('../src');
const assert = require('assert')

// Content for the test cases
let xml_source = `
<root> 
	<bookstores>
		<bookstore>
			<name_lead>Name_lead_1</name_lead> 
			<name_trail>Name_trail_1</name_trail> 
			<address>Bookstore_address_1</address> 
			<available_novels> 
				<novel> 
					<title>Title_1</title> 
					<author>Author_1</author> 
					<novel_details>
						<year>2000</year> 
					</novel_details>
				</novel> 
				<novel> 
					<title>Title_2</title> 
					<author>Author_2</author> 
					<novel_details>
						<year>2000</year> 
					</novel_details>
				</novel> 
			</available_novels>
			<unavailable_novels> 
				<novel> 
					<title>Title_3</title> 
					<author>Author_3</author> 
					<novel_details>
						<year>2000</year> 
					</novel_details>
				</novel> 
				<novel> 
					<title>Title_4</title> 
					<author>Author_4</author> 
					<novel_details>
						<year>2000</year> 
					</novel_details>
				</novel> 
			</unavailable_novels>
		</bookstore>
	</bookstores>
</root>
`

let xsd_source = `
<xs:schema attributeFormDefault="unqualified" elementFormDefault="qualified" xmlns:xs="http://www.w3.org/2001/XMLSchema">
    <xs:element name="root">
        <xs:complexType>
        <xs:sequence>
            <xs:element name="bookstores">
            <xs:complexType>
                <xs:sequence>
                <xs:element name="bookstore">
                    <xs:complexType>
                    <xs:sequence>
                        <xs:element type="xs:string" name="name_lead"/>
                        <xs:element type="xs:string" name="name_trail"/>
                        <xs:element type="xs:string" name="address"/>
                        <xs:element name="available_novels">
                        <xs:complexType>
                            <xs:sequence>
                            <xs:element name="novel" maxOccurs="unbounded" minOccurs="0">
                                <xs:complexType>
                                <xs:sequence>
                                    <xs:element type="xs:string" name="title"/>
                                    <xs:element type="xs:string" name="author"/>
                                    <xs:element name="novel_details">
                                    <xs:complexType>
                                        <xs:sequence>
                                        <xs:element type="xs:short" name="year"/>
                                        </xs:sequence>
                                    </xs:complexType>
                                    </xs:element>
                                </xs:sequence>
                                </xs:complexType>
                            </xs:element>
                            </xs:sequence>
                        </xs:complexType>
                        </xs:element>
                        <xs:element name="unavailable_novels">
                        <xs:complexType>
                            <xs:sequence>
                            <xs:element name="novel" maxOccurs="unbounded" minOccurs="0">
                                <xs:complexType>
                                <xs:sequence>
                                    <xs:element type="xs:string" name="title"/>
                                    <xs:element type="xs:string" name="author"/>
                                    <xs:element name="novel_details">
                                    <xs:complexType>
                                        <xs:sequence>
                                        <xs:element type="xs:short" name="year"/>
                                        </xs:sequence>
                                    </xs:complexType>
                                    </xs:element>
                                </xs:sequence>
                                </xs:complexType>
                            </xs:element>
                            </xs:sequence>
                        </xs:complexType>
                        </xs:element>
                    </xs:sequence>
                    </xs:complexType>
                </xs:element>
                </xs:sequence>
            </xs:complexType>
            </xs:element>
        </xs:sequence>
        </xs:complexType>
    </xs:element>
</xs:schema>`

let xml_target = 
`<?xml version="1.0" encoding="UTF-8"?>
<root>
   <bookstores>
      <bookstore>
         <store_details>
            <name>Name_lead_1Name_trail_1</name>
            <address>Bookstore_address_1</address>
         </store_details>
         <books>
            <book>
               <title>Title_1</title>
               <author>Author_1</author>
               <year>2000</year>
            </book>
            <book>
               <title>Title_2</title>
               <author>Author_2</author>
               <year>2000</year>
            </book>
            <book>
               <title>Title_3</title>
               <author>Author_3</author>
               <year>2000</year>
            </book>
            <book>
               <title>Title_4</title>
               <author>Author_4</author>
               <year>2000</year>
            </book>
         </books>
      </bookstore>
   </bookstores>
</root>`

let xsd_target =`
<xs:schema attributeFormDefault="unqualified" elementFormDefault="qualified" xmlns:xs="http://www.w3.org/2001/XMLSchema"> 
	<xs:element name="root"> 
		<xs:complexType> 
			<xs:sequence> 
				<xs:element name="bookstores"> 
					<xs:complexType> 
						<xs:sequence> 
							<xs:element name="bookstore"> 
								<xs:complexType> 
									<xs:sequence> 
										<xs:element name="store_details"> 
											<xs:complexType> 
												<xs:sequence> 
													<xs:element type="xs:string" name="name"/> 
													<xs:element type="xs:string" name="address"/> 
													<xs:element type="xs:string" name="opening_hours" minOccurs="0"/> 
												</xs:sequence> 
											</xs:complexType> 
										</xs:element> 
										<xs:element name="books"> 
											<xs:complexType> 
												<xs:sequence> 
													<xs:element name="book" maxOccurs="unbounded" minOccurs="0"> 
														<xs:complexType> 
															<xs:sequence> 
																<xs:element type="xs:string" name="title"/> 
																<xs:element type="xs:string" name="author"/> 
																<xs:element type="xs:short" name="year"/> 
															</xs:sequence> 
														</xs:complexType> 
													</xs:element> 
												</xs:sequence> 
											</xs:complexType> 
										</xs:element> 
									</xs:sequence>
								</xs:complexType> 
							</xs:element> 
						</xs:sequence> 
					</xs:complexType> 
				</xs:element> 
			</xs:sequence> 
		</xs:complexType> 
	</xs:element> 
</xs:schema>
`

let mapping = [
	{
        "target": "root",
        "sources": []
    },
	{
        "target": "bookstores",
        "sources": []
    },
	{
        "target": "bookstore",
        "sources": []
    },
	{
        "target": "store_details",
        "sources": []
    },
	{
        "target": "name",
        "sources": ["root/bookstores/bookstore/name_lead", "root/bookstores/bookstore/name_trail"]
    },
	{
        "target": "address",
        "sources": ["root/bookstores/bookstore/address"]
    },
	{
        "target": "books",
        "sources": ["root/bookstores/bookstore/available_novels/novel", "root/bookstores/bookstore/unavailable_novels/novel"]
    },
	{
        "target": "book",
        "sources": []
    },
	{
        "target": "title",
        "sources": ["title"]
    },
	{
        "target": "author",
        "sources": ["author"]
    },
	{
        "target": "year",
        "sources": ["novel_details/year"]
    }
]

// Test cases for xmlNode
describe('xmlNode', function () {
    describe('#constructor()', function () {
        it('should create xmlNode instance', function () {
            xml_node = new utils.xmlNode()
            assert(xml_node instanceof utils.xmlNode)
        });
        it('should initialise with null if no paramiters given', function () {
            xml_node = new utils.xmlNode()
            assert.equal(xml_node.name, null);
            assert.equal(xml_node.type, null);
            assert.deepEqual(xml_node.sources, []);
            assert.deepEqual(xml_node.children, []);
        });
        it('should initialise with values if paramiters given', function () {
            const node_name = "name"
            const node_type = "type"
            xml_node = new utils.xmlNode(node_name, node_type)
            assert.equal(xml_node.name, node_name);
            assert.equal(xml_node.type, node_type);
        });
        it('should throw an error with a invalid name or type', function () {
            const bad_function = () => {
                new utils.xmlNode("name with spaces", "type")
            }
            assert.throws(bad_function);
        });
    });
    describe('#validate_xmlNode_syntax()', function () {
        it('should return true with a valid xslt_node', function () {
            xml_node = new utils.xmlNode()
            assert(utils.xmlNode.validate_xmlNode_syntax(xml_node));
        });
        it('should throw an error with a invalid xslt_node', function () {
            const bad_function = () => {
                utils.xmlNode.validate_xmlNode_syntax("worms")
            }
            assert.throws(bad_function);
        });
    });
    describe('#set_name()', function () {
        it('should throw error with invalid name', function () {
            const xml_node = new utils.xmlNode()
            const bad_function = () => {
                xml_node.set_name("worms rock")
            }
            assert.throws(bad_function);
        });
        it('should update the instances name', function () {
            const xml_node = new utils.xmlNode()
            xml_node.set_name("worms_rock")
            assert.equal(xml_node.name, "worms_rock");
        });
    });
    describe('#set_type()', function () {
        it('should throw error with invalid type', function () {
            const xml_node = new utils.xmlNode()
            const bad_function = () => {
                xml_node.set_type(999)
            }
            assert.throws(bad_function);
        });
        it('should update the instances type', function () {
            const xml_node = new utils.xmlNode()
            xml_node.set_type("xs:string")
            assert.equal(xml_node.type, "xs:string");
        });
    });
    describe('#set_sources()', function () {
        it('should update the instances sources', function () {
            const xml_node = new utils.xmlNode()
            xml_node.set_sources([".Xpath", ".Xpath"])
            assert.deepEqual(xml_node.sources, [".Xpath", ".Xpath"]);
        });
        it('should throw error if sources arent valid Xpaths', function () {
            const xml_node = new utils.xmlNode()
            const bad_function = () => {
                xml_node.set_sources([".Xpath", 1])
            }
            assert.throws(bad_function);
        });
    });
    describe('#add_child()', function () {
        it('should update the instances children', function () {
            const xml_node = new utils.xmlNode()
            const child_node = new utils.xmlNode()
            xml_node.add_child(child_node)
            assert(xml_node.children.includes(child_node));
        });
        it('should throw error if child isnt of type xsltNode', function () {
            const xml_node = new utils.xmlNode()
            const bad_function = () => {
                xml_node.add_child("child_node")
            }
            assert.throws(bad_function);
        });
    });
});

// Test cases for xsltSchema
describe('xsltSchema', function () {
    describe('#constructor()', function () {
        it('should create xsltSchema instance', function () {
            xslt_schema = new utils.xsltSchema(xsd_source, xsd_target, mapping)
            assert(xslt_schema instanceof utils.xsltSchema)
        });
        it('should throw error if any paramiters arent given', function () {
            const bad_function = () => {
                xslt_schema = new utils.xsltSchema()
            }
            assert.throws(bad_function);
        });
        it('should initialise with values if paramiters given', function () {
            xslt_schema = new utils.xsltSchema(xsd_source, xsd_target, mapping)
            assert.equal(xslt_schema.xsd_source, xsd_source);
            assert.equal(xslt_schema.xsd_target, xsd_target);
            assert.equal(xslt_schema.mapping_object, mapping);
        });
        it('should throw error if any xsd_source is invalid', function () {
            let xsd_source_corrupt = `
            <xs:schema attributeFormDefault="unqualified" elementFormDefault="qualified" xmlns:xs="http://www.w3.org/2001/XMLSchema">
                <xs:element name="root">
                    <xs:complexType>
                    <xs:sequence>`
            const bad_function = () => {
                new utils.xsltSchema(xsd_source_corrupt, xsd_target, mapping)
            }
            assert.throws(bad_function);
        });
        it('should throw error if any xsd_target is invalid', function () {
            let xsd_target_corrupt = `
            <xs:schema attributeFormDefault="unqualified" elementFormDefault="qualified" xmlns:xs="http://www.w3.org/2001/XMLSchema">
                <xs:element name="root">
                    <xs:complexType>
                    <xs:sequence>`
            const bad_function = () => {
                new utils.xsltSchema(xsd_source, xsd_target_corrupt, mapping)
            }
            assert.throws(bad_function);
        });
    });
    describe('#init()', function () {
        it('should update the instances node_tree and xslt', async function () {
            xslt_schema = new utils.xsltSchema(xsd_source, xsd_target, mapping)
            await xslt_schema.init()
            assert(xslt_schema.node_tree)
            assert(xslt_schema.xslt)
        });
    });
    describe('#validate_xsd_syntax()', function () {
        it('should return true if a valid xsd', function () {
            assert(utils.xsltSchema.validate_xsd_syntax(xsd_target))
        });
        it('should thow an error if an invalid xsd', function () {
            const bad_function = () => {
                utils.xsltSchema.validate_xsd_syntax(`bad xsd`)
            }
            assert.throws(bad_function);
        });
    });
    describe('#validate_mapping()', function () {
        it('should return true if a valid mapping', function () {
            assert(new utils.xsltSchema(xsd_source, xsd_target, mapping))
        });
        it('should thow an error if an invalid mapping syntax', function () {
            const bad_function = () => {
                new utils.xsltSchema(xsd_source, xsd_target, [
                    ...mapping,
                    {
                        "place": "root", // 'place' is incorrect syntax
                        "sources": []
                    }
                ])
            }
            assert.throws(bad_function);
        });
    });
    describe('#create_node_tree()', function () {
        it('should return a promise', function () {
            assert(utils.xsltSchema.create_node_tree(xsd_source, mapping) instanceof Promise)
        });
        it('should return content', async function () {
            const xslt_node_tree = await utils.xsltSchema.create_node_tree(xsd_source, mapping)
            assert(xslt_node_tree)
        });
        it('should return a node tree of the correct content', async function () {
            const xslt_node_tree = await utils.xsltSchema.create_node_tree(xsd_source, mapping)
            const required_node_tree = `{"name":"root","type":"object","sources":[],"children":[{"name":"bookstores","type":"object","sources":[],"children":[{"name":"bookstore","type":"object","sources":[],"children":[{"name":"address","type":"xs:string","sources":["root/bookstores/bookstore/address"],"children":[]}]}]}]}`
            assert.deepEqual(required_node_tree, JSON.stringify(xslt_node_tree))
        });
    });
    describe('#create_xslt()', function () {
        it('should update the instance xslt', async function () {
            xslt_schema = new utils.xsltSchema(xsd_source, xsd_target, mapping)
            await xslt_schema.init()
            assert(xslt_schema.xslt)
        });
        it('should return a xslt of the correct content', async function () {
            xslt_schema = new utils.xsltSchema(xsd_source, xsd_target, mapping)
            await xslt_schema.init()
            const xslt_target = `"<xsl:stylesheet xmlns:xsl=\\"http://www.w3.org/1999/XSL/Transform\\" version=\\"2.0\\"><xsl:output indent=\\"yes\\" method=\\"xml\\"/><xsl:template match=\\"/\\"><xsl:call-template name=\\"root\\"/></xsl:template><xsl:template name=\\"root\\"><root><xsl:call-template name=\\"root_bookstores\\"/></root></xsl:template><xsl:template name=\\"root_bookstores\\"><bookstores><xsl:call-template name=\\"root_bookstores_bookstore\\"/></bookstores></xsl:template><xsl:template name=\\"root_bookstores_bookstore\\"><bookstore><xsl:call-template name=\\"root_bookstores_bookstore_store_details\\"/><xsl:call-template name=\\"root_bookstores_bookstore_books\\"/></bookstore></xsl:template><xsl:template name=\\"root_bookstores_bookstore_store_details\\"><store_details><xsl:call-template name=\\"root_bookstores_bookstore_store_details_name\\"/><xsl:call-template name=\\"root_bookstores_bookstore_store_details_address\\"/></store_details></xsl:template><xsl:template name=\\"root_bookstores_bookstore_store_details_name\\"><name><xsl:apply-templates select=\\"root/bookstores/bookstore/name_lead | root/bookstores/bookstore/name_trail\\" mode=\\"combine\\"/></name></xsl:template><xsl:template name=\\"root_bookstores_bookstore_store_details_address\\"><address><xsl:apply-templates select=\\"root/bookstores/bookstore/address\\"/></address></xsl:template><xsl:template name=\\"root_bookstores_bookstore_books\\"><books><xsl:apply-templates select=\\"root/bookstores/bookstore/available_novels/novel | root/bookstores/bookstore/unavailable_novels/novel\\"/></books></xsl:template><xsl:template match=\\"root/bookstores/bookstore/available_novels/novel | root/bookstores/bookstore/unavailable_novels/novel\\"><book><xsl:call-template name=\\"root_bookstores_bookstore_books_book_title\\"/><xsl:call-template name=\\"root_bookstores_bookstore_books_book_author\\"/><xsl:call-template name=\\"root_bookstores_bookstore_books_book_year\\"/></book></xsl:template><xsl:template name=\\"root_bookstores_bookstore_books_book_title\\"><title><xsl:apply-templates select=\\"title\\"/></title></xsl:template><xsl:template name=\\"root_bookstores_bookstore_books_book_author\\"><author><xsl:apply-templates select=\\"author\\"/></author></xsl:template><xsl:template name=\\"root_bookstores_bookstore_books_book_year\\"><year><xsl:apply-templates select=\\"novel_details/year\\"/></year></xsl:template></xsl:stylesheet>"`
            assert.deepEqual(JSON.stringify(xslt_schema.xslt), xslt_target)
        });
    });
});

// Test cases for xsltTransformer
describe('xsltTransformer', function () {
    describe('#constructor()', function () {
        it('should create xsltTransformer instance', async function () {
            xslt_schema = new utils.xsltSchema(xsd_source, xsd_target, mapping)
            await xslt_schema.init()
            xslt_transformer = new utils.xsltTransformer(JSON.stringify(xslt_schema))
            assert(xslt_transformer instanceof utils.xsltTransformer)
        });
        it('should throw error if a non serialised xsltSchema given', async function () {
            xslt_schema = new utils.xsltSchema(xsd_source, xsd_target, mapping)
            await xslt_schema.init()
            const bad_function = () => {
                xslt_transformer = new utils.xsltTransformer(xslt_schema)
            }
            assert.throws(bad_function);
        });
        it('should throw error if xsltSchame isnt wellformed', async function () {
            xslt_schema = new utils.xsltSchema(xsd_source, xsd_target, mapping)
            await xslt_schema.init()
            const bad_function = () => {
                xslt_schema_serialised = JSON.stringify(xslt_schema)
                xslt_schema_deserialised = JSON.parse(xslt_schema_serialised)
                delete xslt_schema_deserialised.xsd_source
                xslt_schema_serialised_corrupt = JSON.stringify(xslt_schema_deserialised)
                xslt_transformer = new utils.xsltTransformer(xslt_schema_serialised_corrupt)
            }
            assert.throws(bad_function);
        });
        it('should initialise with values if paramiters given', async function () {
            xslt_schema = new utils.xsltSchema(xsd_source, xsd_target, mapping)
            await xslt_schema.init()
            xslt_transformer = new utils.xsltTransformer(JSON.stringify(xslt_schema))
            assert.equal(xslt_schema.xsd_source, xslt_transformer.xsd_source);
            assert.equal(xslt_schema.xsd_target, xslt_transformer.xsd_target);
            assert.equal(xslt_schema.xslt, xslt_transformer.xslt);
        });
    });
    describe('#transform()', function () {
        it('should return the correct xml', async function () {
            xslt_schema = new utils.xsltSchema(xsd_source, xsd_target, mapping)
            await xslt_schema.init()
            xslt_transformer = new utils.xsltTransformer(JSON.stringify(xslt_schema))
            xml_transformed = await xslt_transformer.transform(xml_source)
            assert.deepEqual(xml_transformed, xml_target)
        });
    });
    describe('#validate_xml_syntax()', function () {
        it('should return true for a valid syntax', function () {
            assert(utils.xsltTransformer.validate_xml_syntax(xml_source))
        });
        it('should return false for a invalid syntax', function () {
            assert(!utils.xsltTransformer.validate_xml_syntax(xml_source.slice(0, -5)))
        });
    });
    describe('#validate_xml_schema()', function () {
        it('should return true for a xml valid schema', function () {
            assert(utils.xsltTransformer.validate_xml_schema(xml_source, xsd_source))
        });
        it('should return false for a xml invalid schema', function () {
            xml_source_corrupt = `
            <root> 
                <bookstores>
                    <bookstore>
                        <name_lead>Name_lead_1</name_lead> 
                        <name_trail>Name_trail_1</name_trail> 
                        <address>Bookstore_address_1</address> 
                        <available_novels> `
            assert(!utils.xsltTransformer.validate_xml_schema(xml_source_corrupt, xsd_source))
        });
    });
})