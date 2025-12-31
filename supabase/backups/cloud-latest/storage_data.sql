SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict JNXBO9QvfvqhUykQDLdYBKaPEWUsE1rwAbUQJ8qhJQrvplRfET0L4minvq0QkTW

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."buckets" ("id", "name", "owner", "created_at", "updated_at", "public", "avif_autodetection", "file_size_limit", "allowed_mime_types", "owner_id", "type") FROM stdin;
results	results	\N	2025-12-01 09:01:47.159516+00	2025-12-01 09:01:47.159516+00	t	f	10485760	{image/png,image/jpeg,image/jpg,image/webp}	\N	STANDARD
documents	documents	\N	2025-12-01 09:01:48.284995+00	2025-12-01 09:01:48.284995+00	t	f	52428800	{application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document}	\N	STANDARD
ai-prompt-images	ai-prompt-images	\N	2025-12-12 05:00:14.462641+00	2025-12-12 05:00:14.462641+00	t	f	\N	\N	\N	STANDARD
\.


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."buckets_analytics" ("name", "type", "format", "created_at", "updated_at", "id", "deleted_at") FROM stdin;
\.


--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."buckets_vectors" ("id", "type", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."objects" ("id", "bucket_id", "name", "owner", "created_at", "updated_at", "last_accessed_at", "metadata", "version", "owner_id", "user_metadata", "level") FROM stdin;
e887e5de-1030-4f50-ae7d-a700cdfabaa2	ai-prompt-images	prompts/1765515663275-w5q5f6.jpg	\N	2025-12-12 05:01:05.579518+00	2025-12-12 05:01:05.579518+00	2025-12-12 05:01:05.579518+00	{"eTag": "\\"10e9ddb3089f41f839467b947f1c2333\\"", "size": 184385, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-12-12T05:01:06.000Z", "contentLength": 184385, "httpStatusCode": 200}	a152d5f5-dc1e-48d8-8c96-f5e0691dd942	\N	{}	2
8561b6d8-18eb-4448-ab7b-ae3f3edfca9d	ai-prompt-images	prompts/1765517237986-l3gyex.jpg	\N	2025-12-12 05:27:20.181751+00	2025-12-12 05:27:20.181751+00	2025-12-12 05:27:20.181751+00	{"eTag": "\\"12f964d4352577618031607beec3f4a8\\"", "size": 177256, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-12-12T05:27:21.000Z", "contentLength": 177256, "httpStatusCode": 200}	cab159f4-db7f-4905-acc7-336779404e1a	\N	{}	2
74a35aa3-6e1a-4f62-be1c-f47234da6eba	ai-prompt-images	prompts/1765518374020-yoc02q.jpg	\N	2025-12-12 05:46:16.545237+00	2025-12-12 05:46:16.545237+00	2025-12-12 05:46:16.545237+00	{"eTag": "\\"e81d9b88c6185ddaf5a97ed6a4a91858\\"", "size": 170945, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-12-12T05:46:17.000Z", "contentLength": 170945, "httpStatusCode": 200}	c1a86aed-cbb8-4eb4-9c92-0485cd64025a	\N	{}	2
a816773e-6ad9-47d5-81b3-eb85c9378a03	ai-prompt-images	prompts/1765518383041-ja6kic.jpg	\N	2025-12-12 05:46:24.946449+00	2025-12-12 05:46:24.946449+00	2025-12-12 05:46:24.946449+00	{"eTag": "\\"e81d9b88c6185ddaf5a97ed6a4a91858\\"", "size": 170945, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-12-12T05:46:25.000Z", "contentLength": 170945, "httpStatusCode": 200}	188199a4-bd7c-4c77-a6b0-3ff53db6b1b2	\N	{}	2
dc99b0e8-c1b4-4903-b2e9-6e1d13c5b4f5	ai-prompt-images	prompts/1765518426359-otz3ky.jpg	\N	2025-12-12 05:47:08.341369+00	2025-12-12 05:47:08.341369+00	2025-12-12 05:47:08.341369+00	{"eTag": "\\"0a64223a3676c3009f0f0c54e2fdec03\\"", "size": 100422, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-12-12T05:47:09.000Z", "contentLength": 100422, "httpStatusCode": 200}	25f91d5c-fa89-4bb9-93a3-40bd058096db	\N	{}	2
088ce435-fc82-482d-9916-06daaed2ec7b	ai-prompt-images	prompts/1765518566444-8ktvwg.jpg	\N	2025-12-12 05:49:28.733147+00	2025-12-12 05:49:28.733147+00	2025-12-12 05:49:28.733147+00	{"eTag": "\\"0a64223a3676c3009f0f0c54e2fdec03\\"", "size": 100422, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-12-12T05:49:29.000Z", "contentLength": 100422, "httpStatusCode": 200}	e1d27d43-1658-41e7-9ae7-9c87d8ec40d5	\N	{}	2
a0be4204-dc6f-4334-860d-e0913710fc77	ai-prompt-images	prompts/1765518578458-lgbwj2.jpg	\N	2025-12-12 05:49:40.586474+00	2025-12-12 05:49:40.586474+00	2025-12-12 05:49:40.586474+00	{"eTag": "\\"e81d9b88c6185ddaf5a97ed6a4a91858\\"", "size": 170945, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-12-12T05:49:41.000Z", "contentLength": 170945, "httpStatusCode": 200}	4742da28-f05b-49f6-bf57-7d455bf8fc12	\N	{}	2
b727662a-dfc6-4105-b7cc-aa443a60b8c7	ai-prompt-images	prompts/1765518658137-gsr6oa.jpg	\N	2025-12-12 05:51:00.194427+00	2025-12-12 05:51:00.194427+00	2025-12-12 05:51:00.194427+00	{"eTag": "\\"798a651662b814fe40d6bf498de51aad\\"", "size": 52633, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-12-12T05:51:01.000Z", "contentLength": 52633, "httpStatusCode": 200}	22b0bf67-439e-4c2e-a27f-04c31d185218	\N	{}	2
5dab8899-9a20-46f9-9f17-599192e1970a	ai-prompt-images	prompts/1765522862241-1nkzis.jpg	\N	2025-12-12 07:01:04.073474+00	2025-12-12 07:01:04.073474+00	2025-12-12 07:01:04.073474+00	{"eTag": "\\"44097a373f74703a8c9ed886a4f6966c\\"", "size": 52953, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-12-12T07:01:05.000Z", "contentLength": 52953, "httpStatusCode": 200}	6c0b4a20-550a-4a48-8f2c-12c08bfdb62d	\N	{}	2
\.


--
-- Data for Name: prefixes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."prefixes" ("bucket_id", "name", "created_at", "updated_at") FROM stdin;
ai-prompt-images	prompts	2025-12-12 05:01:05.579518+00	2025-12-12 05:01:05.579518+00
\.


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."s3_multipart_uploads" ("id", "in_progress_size", "upload_signature", "bucket_id", "key", "version", "owner_id", "created_at", "user_metadata") FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."s3_multipart_uploads_parts" ("id", "upload_id", "size", "part_number", "bucket_id", "key", "etag", "owner_id", "version", "created_at") FROM stdin;
\.


--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."vector_indexes" ("id", "name", "bucket_id", "data_type", "dimension", "distance_metric", "metadata_configuration", "created_at", "updated_at") FROM stdin;
\.


--
-- PostgreSQL database dump complete
--

-- \unrestrict JNXBO9QvfvqhUykQDLdYBKaPEWUsE1rwAbUQJ8qhJQrvplRfET0L4minvq0QkTW

RESET ALL;
