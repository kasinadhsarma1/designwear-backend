# Backend Algorithms & Concepts Guide

This guide covers essential algorithms and concepts specifically tailored for backend development, focusing on performance, scaling, and ensuring security for APIs and data persistence.

---

## 1. Caching Strategies

Caching is critical for reducing database load and speeding up API response times.

### Least Recently Used (LRU) Cache
- **Description**: Evicts the least recently accessed items when the cache limit is reached.
- **Implementations**:
  - Commonly used in **Redis** or **Memcached**.
  - Under the hood: Often implemented using a **Hash Map** combined with a **Doubly Linked List**.
- **Use Cases**: Caching user sessions, frequently accessed products, or static configuration data.
- **Time Complexity (Core Ops)**: `O(1)` for getting and inserting items.

### LFU (Least Frequently Used) Cache
- **Description**: Evicts the items that have been accessed the fewest times.
- **Use Cases**: Useful when you have items that are consistently popular over long periods, rather than just recently popular.

---

## 2. API Security & Rate Limiting

Rate limiting protects your API endpoints from abuse, DDoS attacks, and ensures fair usage among clients.

### Token Bucket Algorithm
- **Description**: Imagine a bucket filled with tokens at a constant rate. Each request costs a token. If the bucket is empty, the request is dropped.
- **Pros**: Allows for bursts of traffic.
- **Use Cases**: Standard API rate limiting.

### Leaky Bucket Algorithm
- **Description**: Requests arrive and go into a bucket. The bucket leaks requests out (processes them) at a constant, steady rate. If the bucket overflows, requests are dropped.
- **Pros**: Smooths out traffic spikes, ensuring a steady processing rate.
- **Use Cases**: Protecting backend systems that can only handle a specific precise load (like an old legacy database or queue).

### Fixed Window Counter
- **Description**: Divides time into fixed windows (e.g., 1 minute). Counts requests in that window. If the count exceeds the limit, block.
- **Pros**: Very easy to implement.
- **Cons**: Can allow double the requests right around the boundary of the window.

---

## 3. Distributed Systems & Scaling

When your backend grows beyond a single server, these algorithms become crucial for distributing data and load.

### Consistent Hashing
- **Description**: A hashing technique that minimizes the number of keys that need to be remapped when a server node is added or removed from the cluster.
- **How it Works**: Servers and data keys are hashed onto a conceptual "ring." A key is assigned to the first server it encounters moving clockwise on the ring.
- **Use Cases**: Essential for distributed caches (like a Redis cluster), load balancers, and distributed databases (like Cassandra or DynamoDB).

### Sharding Strategies (Database)
- While not a pure algorithm, knowing how to split data is algorithmic.
- **Range-Based Sharding**: Splitting based on values (e.g., User IDs 1-1000 on DB 1, 1001-2000 on DB 2).
- **Hash-Based Sharding**: Hashing a key (like user email) and assigning it to a shard based on the hash. Ensures more even distribution.

---

## 4. Database Optimization & Searching

Efficiently finding and paginating data is a constant backend challenge.

### Inverted Indexing (Search)
- **Description**: Instead of a traditional index mapping a document ID to its content, an inverted index maps content (words) to the document IDs that contain them.
- **Use Cases**: Implementing full-text search (the core concept behind Elasticsearch or Typesense).
- **Time Complexity Example**: Looking up a word's occurrence becomes roughly `O(1)` instead of scanning every document `O(N)`.

### Cursor-Based Pagination (Keyset Pagination)
- **Problem with `LIMIT / OFFSET`**: In traditional pagination, `OFFSET 10000 LIMIT 10` requires the database to scan and discard the first 10,000 rows, becoming very slow on deep pages.
- **Cursor Solution**: Pass a unique identifier (cursor) from the last item of the previous page. The query becomes: `SELECT * FROM items WHERE id > last_cursor LIMIT 10`.
- **Pros**: Extremely fast regardless of depth `O(1)` offset.
- **Cons**: You cannot easily jump to page 50 directly; you must paginate sequentially. It also requires a sequential, unique column to sort by.

### B-Trees and Database Indexing
- **Description**: The default underlying data structure for most relational database indexes (like PostgreSQL).
- **Why it matters**: It keeps data sorted and allows for `O(log N)` search, insertion, and deletion times, optimized for minimizing disk read operations compared to standard binary search trees.

---

## 5. Background Processing & Queues

Handling long-running tasks without blocking the main API thread.

### Priority Queues
- **Description**: An abstract data type where each element has a priority. Elements with higher priority are served before those with lower priority.
- **Implementations**: Often implemented using Heaps (Min-Heap or Max-Heap).
- **Use Cases**: Scheduling background jobs (e.g., processing a high-priority payment vs. a low-priority welcome email).
- **Time Complexity**: `O(log N)` for insertion and extraction.


---

## 6. Graph & Routing Algorithms

When building social features, recommendation engines, or logistics platforms.

### Dijkstra's Algorithm
- **Description**: Finds the shortest path between nodes in a graph with non-negative edge weights.
- **Use Cases**: Calculating delivery routes, finding shortest paths in network routing protocols, determining the quickest connections in a social network.

### Topological Sorting
- **Description**: Linear ordering of vertices such that for every directed edge `u -> v`, vertex `u` comes before `v`.
- **Use Cases**: Useful when resolving complex dependencies (like determining the exact build order for a microservices architecture, or executing a complex workflow graph).

---

## 7. Concurrency & Data Consistency

Dealing with race conditions when multiple users hit the database simultaneously.

### Optimistic Concurrency Control (OCC)
- **Description**: Assumes multiple transactions can complete without affecting each other. It doesn't lock rows immediately; instead, it checks a "version" or "timestamp" field right before committing. If the version changed during the transaction, it rolls back and retries.
- **Use Cases**: High-read, low-write environments (e.g., updating user profiles). Prevents the "Lost Update" problem.

### Pessimistic Locking
- **Description**: Assumes conflicts will happen. It locks the row `SELECT ... FOR UPDATE` immediately when it's read, preventing any other transaction from modifying it until the first one is done.
- **Use Cases**: High-contention environments where data integrity is paramount (e.g., financial transactions, cart inventory reservations at checkout).

---

## 8. Geolocation Algorithms

Essential for any app filtering by location or showing objects on a map.

### GeoHashing
- **Description**: An algorithm that encodes geographical coordinates (latitude and longitude) into a short string of letters and numbers.
- **How it works**: Divides the earth into a grid of buckets. Elements close to each other will share a common prefix in their geohash string.
- **Use Cases**: Extremely fast database lookups for "find entities within X radius of my location" (Redis has built-in GeoHash support). Very useful for delivery or driver apps.

## Next Steps for Preparation
- [ ] Understand the difference between Token Bucket and Leaky Bucket conceptually.
- [ ] Implement a basic LRU Cache in code (common interview question).
- [ ] Understand how Consistent Hashing handles server failures.
- [ ] Write a SQL query using Cursor-based pagination vs. Offset pagination to understand the performance difference.
- [ ] Understand when to use Optimistic vs. Pessimistic locking for inventory management.
- [ ] Learn the basic concept of how Redis uses GeoHashes for location-based queries.
