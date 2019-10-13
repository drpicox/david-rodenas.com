---
title: Neo4j
image_width: 163
image_height: 162
image: /assets/images/neo4j.png
url: http://www.neo4j.org/
source: https://github.com/neo4j/neo4j
description: >
  A fashion open-source database 
  designed to store graphs.
tags:
  - apps  
---
Neo4j stores data as a graph
instead of tables as most of databases engines does.
The key point is that while most of 
databases are fast listing values but slow making joins,
graph databases are fast following joins but not so fast
listing values.

Neo4j can work as a library 
(very fast access for a single app)
or as a database server shared with multiple apps.


```java
GraphDatabaseService graphDb;
Node firstNode;
Node secondNode;
Relationship relationship;

graphDb = new GraphDatabaseFactory().newEmbeddedDatabase( DB_PATH );
registerShutdownHook( graphDb );

firstNode = graphDb.createNode();
firstNode.setProperty( "message", "Hello, " );
secondNode = graphDb.createNode();
secondNode.setProperty( "message", "World!" );
 
relationship = firstNode.createRelationshipTo( secondNode, RelTypes.KNOWS );
relationship.setProperty( "message", "brave Neo4j " );

System.out.print( firstNode.getProperty( "message" ) );
System.out.print( relationship.getProperty( "message" ) );
System.out.print( secondNode.getProperty( "message" ) );

firstNode.getSingleRelationship( RelTypes.KNOWS, Direction.OUTGOING ).delete();
firstNode.delete();
secondNode.delete();

graphDb.shutdown();
```
