

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pgsodium";






CREATE SCHEMA IF NOT EXISTS "postgis";


ALTER SCHEMA "postgis" OWNER TO "postgres";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "postgis" WITH SCHEMA "postgis";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."calculate_user_balance"("user_id" "text") RETURNS numeric
    LANGUAGE "plpgsql"
    AS $$DECLARE
  v_user_id UUID;
  v_balance NUMERIC := 0;
  v_sales_balance NUMERIC := 0;
  v_rentals_balance NUMERIC := 0;
BEGIN
  v_user_id := user_id::UUID;

  WITH accepted_sales AS (
    SELECT 
      sp.offered_price,
      p.sender_id,
      p.receiver_id,
      sl.owner_id
    FROM sale_proposals sp
    JOIN proposals p ON sp.id = p.id
    JOIN sale_listings sl ON p.listing_id = sl.id
    JOIN proposal_statuses ps ON p.proposal_status_id = ps.id
    WHERE ps.description = 'accepted'
      AND (v_user_id = p.sender_id OR v_user_id = p.receiver_id)
  )
  SELECT COALESCE(SUM(
    CASE
      WHEN v_user_id = owner_id THEN offered_price
      ELSE -offered_price
    END
  ), 0)
  INTO v_sales_balance
  FROM accepted_sales;

  WITH accepted_rentals AS (
    SELECT 
      rp.offered_rent_per_day,
      rp.start_date,
      rp.end_date,
      p.sender_id,
      p.receiver_id,
      rl.owner_id,
      DATE_PART('day', rp.end_date - rp.start_date) AS rental_days
    FROM rental_proposals rp
    JOIN proposals p ON rp.id = p.id
    JOIN rental_listings rl ON p.listing_id = rl.id
    JOIN proposal_statuses ps ON p.proposal_status_id = ps.id
    WHERE ps.description = 'accepted'
      AND (v_user_id = p.sender_id OR v_user_id = p.receiver_id)
  )
  SELECT COALESCE(SUM(
    CASE
      WHEN v_user_id = owner_id THEN offered_rent_per_day * rental_days
      ELSE -offered_rent_per_day * rental_days
    END
  ), 0)
  INTO v_rentals_balance
  FROM accepted_rentals;

  v_balance := v_sales_balance + v_rentals_balance;

  RETURN COALESCE(v_balance, 0);

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Erro ao calcular saldo do utilizador %: %', user_id, SQLERRM;
END;$$;


ALTER FUNCTION "public"."calculate_user_balance"("user_id" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_listing"("title" "text", "description" "text", "category" "text", "listing_type" "text", "user_id" "text", "product_condition" "text" DEFAULT NULL::"text", "price" numeric DEFAULT NULL::numeric, "is_negotiable" boolean DEFAULT NULL::boolean, "deposit_required" boolean DEFAULT NULL::boolean, "deposit_value" numeric DEFAULT NULL::numeric, "cost_per_day" numeric DEFAULT NULL::numeric, "auto_close_date" "date" DEFAULT NULL::"date", "rental_duration_limit" integer DEFAULT NULL::integer, "late_fee" numeric DEFAULT NULL::numeric, "desired_item" "text" DEFAULT NULL::"text", "recipient_requirements" "text" DEFAULT NULL::"text") RETURNS integer
    LANGUAGE "plpgsql"
    AS $$DECLARE
  v_user_id UUID;
  v_category_id INT;
  v_listing_status_id INT;
  v_listing_id INT;
  v_product_condition_id INT := NULL; 
  v_listing_type_id INT;
BEGIN
  v_user_id := create_listing.user_id::UUID;

  SELECT pc.id INTO v_category_id
  FROM public.product_categories AS pc
  WHERE pc.category = create_listing.category;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Categoria inválida: %', create_listing.category;
  END IF;

  SELECT ls.id INTO v_listing_status_id
  FROM public.listing_statuses AS ls
  WHERE ls.description = 'active';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Status "active" inválido ou não encontrado.';
  END IF;

  IF create_listing.listing_type = 'sale' AND create_listing.product_condition IS NOT NULL THEN
    SELECT pco.id INTO v_product_condition_id
    FROM public.product_conditions AS pco
    WHERE pco.condition = create_listing.product_condition;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Condição de produto inválida: %', create_listing.product_condition;
    END IF;
  END IF;

  SELECT lt.id INTO v_listing_type_id
  FROM public.listing_types AS lt
  WHERE lt.description = create_listing.listing_type;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tipo de anúncio inválido: %', create_listing.listing_type;
  END IF;

  CASE create_listing.listing_type
    WHEN 'sale' THEN
      INSERT INTO public.sale_listings (
        title, description, owner_id, category_id, listing_status,
        price, product_condition, is_negotiable, listing_type
      ) VALUES (
        create_listing.title, create_listing.description, v_user_id, v_category_id,
        v_listing_status_id, create_listing.price, v_product_condition_id, create_listing.is_negotiable, v_listing_type_id
      )
      RETURNING id INTO v_listing_id;

    WHEN 'rental' THEN
      INSERT INTO public.rental_listings (
        title, description, owner_id, category_id, listing_status,
        deposit_required, deposit_value, cost_per_day,
        auto_close_date, rental_duration_limit, late_fee, listing_type
      ) VALUES (
        create_listing.title, create_listing.description, v_user_id, v_category_id, v_listing_status_id,
        create_listing.deposit_required, create_listing.deposit_value, create_listing.cost_per_day,
        create_listing.auto_close_date, create_listing.rental_duration_limit, create_listing.late_fee, v_listing_type_id
      )
      RETURNING id INTO v_listing_id;

    WHEN 'swap' THEN
      INSERT INTO public.swap_listings (
        title, description, owner_id, category_id, listing_status,
        desired_item, listing_type
      ) VALUES (
        create_listing.title, create_listing.description, v_user_id, v_category_id,
        v_listing_status_id, create_listing.desired_item, v_listing_type_id
      )
      RETURNING id INTO v_listing_id;

    WHEN 'giveaway' THEN
      INSERT INTO public.giveaway_listings (
        title, description, owner_id, category_id, listing_status,
        recipient_requirements, listing_type
      ) VALUES (
        create_listing.title, create_listing.description, v_user_id, v_category_id,
        v_listing_status_id, create_listing.recipient_requirements, v_listing_type_id
      )
      RETURNING id INTO v_listing_id;

    ELSE
      RAISE EXCEPTION 'Tipo de anúncio inválido: %', create_listing.listing_type;
  END CASE;

  RETURN v_listing_id;

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Erro ao criar anúncio para utilizador %: %', create_listing.user_id, SQLERRM;
END;$$;


ALTER FUNCTION "public"."create_listing"("title" "text", "description" "text", "category" "text", "listing_type" "text", "user_id" "text", "product_condition" "text", "price" numeric, "is_negotiable" boolean, "deposit_required" boolean, "deposit_value" numeric, "cost_per_day" numeric, "auto_close_date" "date", "rental_duration_limit" integer, "late_fee" numeric, "desired_item" "text", "recipient_requirements" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_location_and_update_profile"("user_id" "text", "address" "text", "latitude" double precision, "longitude" double precision) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'gis', 'postgis'
    AS $$
DECLARE
    new_location_id INT;
    v_user_id UUID;
BEGIN
    BEGIN
        v_user_id := user_id::UUID;

        INSERT INTO postgis.locations (full_address, location, lat, lon)
        VALUES (
            address,
            postgis.st_point(longitude, latitude),
            latitude,
            longitude
        )
        ON CONFLICT (location) DO UPDATE
            SET full_address = EXCLUDED.full_address
        RETURNING id INTO new_location_id;

        UPDATE profiles
        SET location_id = new_location_id
        WHERE id = v_user_id;

    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Erro na função create_location_and_update_profile: %', SQLERRM;
            RAISE;
    END;
END;
$$;


ALTER FUNCTION "public"."create_location_and_update_profile"("user_id" "text", "address" "text", "latitude" double precision, "longitude" double precision) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_proposal"("title" "text", "description" "text", "listing_id" integer, "proposal_type" "text", "proposal_status" "text", "sender_id" "text", "receiver_id" "text", "offered_price" numeric DEFAULT NULL::numeric, "offered_rent_per_day" numeric DEFAULT NULL::numeric, "start_date" "date" DEFAULT NULL::"date", "end_date" "date" DEFAULT NULL::"date", "message" "text" DEFAULT NULL::"text", "swap_with" "text" DEFAULT NULL::"text") RETURNS "jsonb"
    LANGUAGE "plpgsql"
    AS $$DECLARE
  v_sender_id UUID := sender_id::UUID;
  v_receiver_id UUID := receiver_id::UUID;
  v_proposal_type_id INT;
  v_proposal_status_id INT;
  v_new_proposal_id INT;
  v_result JSONB;
BEGIN
  SELECT id INTO v_proposal_type_id
  FROM listing_types lt
  WHERE lt.description = proposal_type;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tipo de proposta inválido: %', proposal_type;
  END IF;

  SELECT id INTO v_proposal_status_id
  FROM proposal_statuses ps
  WHERE ps.description = proposal_status;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Status de proposta inválido: %', proposal_status;
  END IF;

  IF proposal_type = 'sale' THEN
    IF offered_price IS NULL THEN
      RAISE EXCEPTION 'Propostas de venda requerem um preço oferecido.';
    END IF;

    INSERT INTO sale_proposals (
      title, description, listing_id,
      proposal_type_id, proposal_status_id,
      sender_id, receiver_id,
      offered_price, created_at
    ) VALUES (
      create_proposal.title, create_proposal.description, create_proposal.listing_id,
      v_proposal_type_id, v_proposal_status_id,
      v_sender_id, v_receiver_id,
      create_proposal.offered_price, NOW()
    )
    RETURNING id INTO v_new_proposal_id;

  ELSIF proposal_type = 'rental' THEN
    IF offered_rent_per_day IS NULL OR start_date IS NULL OR end_date IS NULL THEN
      RAISE EXCEPTION 'Propostas de aluguer requerem rentabilidade por dia, data de início e data de fim.';
    END IF;

    INSERT INTO rental_proposals (
      title, description, listing_id,
      proposal_type_id, proposal_status_id,
      sender_id, receiver_id,
      offered_rent_per_day, start_date, end_date, created_at
    ) VALUES (
      create_proposal.title, create_proposal.description, create_proposal.listing_id,
      v_proposal_type_id, v_proposal_status_id,
      v_sender_id, v_receiver_id,
      create_proposal.offered_rent_per_day, create_proposal.start_date, create_proposal.end_date, NOW()
    )
    RETURNING id INTO v_new_proposal_id;

  ELSIF proposal_type = 'swap' THEN
    IF swap_with IS NULL THEN
      RAISE EXCEPTION 'Propostas de troca requerem o campo swap_with.';
    END IF;

    INSERT INTO swap_proposals (
      title, description, listing_id,
      proposal_type_id, proposal_status_id,
      sender_id, receiver_id,
      swap_with, created_at
    )
    VALUES (
     create_proposal.title, create_proposal.description, create_proposal.listing_id,
      v_proposal_type_id, v_proposal_status_id,
      v_sender_id, v_receiver_id,
      create_proposal.swap_with, NOW()
    )
    RETURNING id INTO v_new_proposal_id;

  ELSIF proposal_type = 'giveaway' THEN
    IF message IS NULL THEN
      RAISE EXCEPTION 'Propostas de doação requerem uma mensagem.';
    END IF;

    INSERT INTO giveaway_proposals (
      title, description, listing_id,
      proposal_type_id, proposal_status_id,
      sender_id, receiver_id,
      message, created_at
    )
    VALUES (
     create_proposal.title, create_proposal.description, create_proposal.listing_id,
      v_proposal_type_id, v_proposal_status_id,
      v_sender_id, v_receiver_id,
      create_proposal.message, NOW()
    )
    RETURNING id INTO v_new_proposal_id;

  ELSE
    RAISE EXCEPTION 'Tipo de proposta não suportado: %', proposal_type;
  END IF;

  SELECT JSONB_BUILD_OBJECT(
    'id', p.id,
    'title', p.title,
    'description', p.description
  )
  INTO v_result
  FROM proposals p
  WHERE p.id = v_new_proposal_id;

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Erro ao criar proposta: %', SQLERRM;
END;$$;


ALTER FUNCTION "public"."create_proposal"("title" "text", "description" "text", "listing_id" integer, "proposal_type" "text", "proposal_status" "text", "sender_id" "text", "receiver_id" "text", "offered_price" numeric, "offered_rent_per_day" numeric, "start_date" "date", "end_date" "date", "message" "text", "swap_with" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_used_reset_tokens"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$BEGIN
    BEGIN
        DELETE FROM password_reset_tokens
        WHERE used = TRUE
        AND created_at < now() - interval '24 hours';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE EXCEPTION 'Erro ao apagar tokens de recuperação de palavra-passe: %', SQLERRM;
    END;

    RETURN NEW;
END;$$;


ALTER FUNCTION "public"."delete_used_reset_tokens"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fetch_favorites"("user_id" "uuid") RETURNS TABLE("id" integer, "title" "text")
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  BEGIN
    RETURN QUERY
    SELECT
      pl.id AS id,
      pl.title AS title
    FROM
      favorites f
    JOIN
      full_product_listings pl ON f.listing_id = pl.id
    WHERE
      f.user_id = user_id;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE EXCEPTION 'Erro ao buscar os favoritos do utilizador %: %', user_id, SQLERRM;
  END;
END;
$$;


ALTER FUNCTION "public"."fetch_favorites"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fetch_filtered_proposals"("user_id" "uuid", "fetch_limit" integer, "fetch_page" integer, "received" boolean DEFAULT false, "sent" boolean DEFAULT false, "accepted" boolean DEFAULT false, "rejected" boolean DEFAULT false, "cancelled" boolean DEFAULT false, "pending" boolean DEFAULT false) RETURNS TABLE("proposal_id" integer, "title" "text", "description" "text", "sender_id" "uuid", "receiver_id" "uuid", "listing_id" integer, "listing_title" "text", "sender_name" "text", "receiver_name" "text", "proposal_type" "text", "proposal_status" "text", "created_at" timestamp without time zone, "swap_with" "text", "offered_price" numeric, "message" "text", "offered_rent_per_day" numeric, "start_date" timestamp without time zone, "end_date" timestamp without time zone, "total_count" bigint)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  BEGIN
    RETURN QUERY
    WITH base_filtered AS (
      SELECT *
      FROM full_proposals fp
      WHERE
        (
          (NOT received AND NOT sent) OR
          (received AND fp.receiver_id = user_id) OR
          (sent AND fp.sender_id = user_id)
        )
        AND (
          (NOT accepted AND NOT rejected AND NOT cancelled AND NOT pending) OR
          (accepted AND fp.proposal_status = 'accepted') OR
          (rejected AND fp.proposal_status = 'rejected') OR
          (cancelled AND fp.proposal_status = 'cancelled') OR
          (pending AND fp.proposal_status = 'pending')
        )
    ),
    total_count_cte AS (
      SELECT COUNT(*) AS total_count FROM base_filtered
    )
    SELECT 
      fp.id::integer AS proposal_id,
      fp.title::text,
      fp.description::text,
      fp.sender_id::uuid,
      fp.receiver_id::uuid,
      fp.listing_id::integer,
      fp.listing_title::text,
      fp.sender_name::text,
      fp.receiver_name::text,
      fp.proposal_type::text,
      fp.proposal_status::text,
      fp.created_at::timestamp,
      fp.swap_with::text,
      fp.offered_price::numeric,
      fp.message::text,
      fp.offered_rent_per_day::numeric,
      fp.start_date::timestamp,
      fp.end_date::timestamp,
      tc.total_count::bigint
    FROM base_filtered fp
    CROSS JOIN total_count_cte tc
    ORDER BY fp.created_at DESC
    OFFSET GREATEST((fetch_page - 1) * fetch_limit, 0)
    LIMIT fetch_limit;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE EXCEPTION 'Erro ao buscar propostas para o utilizador %: %', user_id, SQLERRM;
  END;
END;
$$;


ALTER FUNCTION "public"."fetch_filtered_proposals"("user_id" "uuid", "fetch_limit" integer, "fetch_page" integer, "received" boolean, "sent" boolean, "accepted" boolean, "rejected" boolean, "cancelled" boolean, "pending" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fetch_home_listings"("fetch_limit" integer, "fetch_offset" integer, "listing_type" "text" DEFAULT NULL::"text", "search" "text" DEFAULT NULL::"text", "lat" double precision DEFAULT NULL::double precision, "lon" double precision DEFAULT NULL::double precision, "dist" double precision DEFAULT NULL::double precision) RETURNS TABLE("id" "text", "title" "text", "type" "text", "price" "text", "cost_per_day" "text", "imageurl" "text", "total_pages" integer)
    LANGUAGE "plpgsql"
    AS $$BEGIN
  BEGIN
    RETURN QUERY
      WITH total AS (
        SELECT COUNT(*) AS cnt
        FROM full_product_listings AS f
        JOIN profiles AS p ON f.owner_id = p.id
        LEFT JOIN postgis.locations AS l ON p.location_id = l.id
        WHERE 
        f.listing_status = 1 AND
          (fetch_home_listings.listing_type IS NULL OR f.listing_type = fetch_home_listings.listing_type)
          AND (search IS NULL OR f.title ILIKE '%' || search || '%')
          AND (
            fetch_home_listings.lat IS NULL OR fetch_home_listings.lon IS NULL OR fetch_home_listings.dist IS NULL OR
            (l.location IS NOT NULL AND
             postgis.st_dwithin(
                l.location,
                postgis.st_setsrid(postgis.st_point(fetch_home_listings.lon, fetch_home_listings.lat), 4326)::postgis.geography,
                fetch_home_listings.dist
             )
            )
          )
      )
      SELECT 
        f.id::text,
        f.title,
        f.listing_type AS type,
        f.price::text,
        f.cost_per_day::text,
        f.main_image_url AS imageUrl,
        CEIL(total.cnt::numeric / NULLIF(fetch_limit, 0))::integer AS total_pages
      FROM full_product_listings AS f
      JOIN profiles AS p ON f.owner_id = p.id
      LEFT JOIN postgis.locations AS l ON p.location_id = l.id
      CROSS JOIN total
      WHERE 
        f.listing_status = 1 AND
        (fetch_home_listings.listing_type IS NULL OR f.listing_type = fetch_home_listings.listing_type)
        AND (search IS NULL OR f.title ILIKE '%' || search || '%')
        AND (
            fetch_home_listings.lat IS NULL OR fetch_home_listings.lon IS NULL OR fetch_home_listings.dist IS NULL OR
            (l.location IS NOT NULL AND
             postgis.st_dwithin(
                l.location,
                postgis.st_setsrid(postgis.st_point(fetch_home_listings.lon, fetch_home_listings.lat), 4326)::postgis.geography,
                fetch_home_listings.dist
             )
            )
        )
      ORDER BY f.id
      LIMIT fetch_limit OFFSET fetch_offset;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE EXCEPTION 'Erro ao fazer fetch de anúncios da home: %', SQLERRM;
  END;
END;$$;


ALTER FUNCTION "public"."fetch_home_listings"("fetch_limit" integer, "fetch_offset" integer, "listing_type" "text", "search" "text", "lat" double precision, "lon" double precision, "dist" double precision) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fetch_user_listings"("owner_id" "uuid", "fetch_limit" integer, "fetch_offset" integer) RETURNS TABLE("id" "text", "title" "text", "type" "text", "price" numeric, "priceperday" numeric, "main_image_url" "text")
    LANGUAGE "plpgsql"
    AS $$BEGIN
  BEGIN
    RETURN QUERY
      SELECT
        f.id::text,
        f.title,
        f.listing_type AS type,
        f.price::numeric,
        f.cost_per_day::numeric AS priceperday,
        f.main_image_url AS image_url
      FROM full_product_listings f
      WHERE f.listing_status = 1 AND
      f.owner_id = fetch_user_listings.owner_id
      ORDER BY f.id
      LIMIT fetch_limit OFFSET fetch_offset;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE EXCEPTION 'Erro ao fazer fetch dos anúncios para o utilizador %: %', owner_id, SQLERRM;
  END;
END;$$;


ALTER FUNCTION "public"."fetch_user_listings"("owner_id" "uuid", "fetch_limit" integer, "fetch_offset" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fetch_user_location"("user_id" "uuid") RETURNS TABLE("location_id" integer, "full_address" "text", "lat" double precision, "lon" double precision, "created_at" timestamp without time zone)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  BEGIN
    RETURN QUERY
    SELECT 
      l.id AS location_id,
      l.full_address,
      l.lat,
      l.lon,
      l.created_at
    FROM public.profiles AS p
    JOIN postgis.locations AS l ON p.location_id = l.id
    WHERE p.id = user_id
      AND p.is_deleted IS NOT TRUE;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE EXCEPTION 'Erro ao buscar localização para o utilizador %: %', user_id, SQLERRM;
  END;
END;
$$;


ALTER FUNCTION "public"."fetch_user_location"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_basic_user_info"("user_id" "uuid") RETURNS TABLE("id" "uuid", "username" "text", "name" "text", "location_id" "uuid", "is_deleted" boolean, "deleted_at" timestamp without time zone, "created_at" timestamp without time zone, "last_sign_in_at" timestamp without time zone)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.username,
        p.name,
        p.location_id,
        p.is_deleted,
        p.deleted_at,
        u.created_at,
        u.last_sign_in_at
    FROM profiles p
    JOIN auth.users u ON p.id = u.id
    WHERE p.id = user_id; 
  EXCEPTION
    WHEN OTHERS THEN
      RAISE EXCEPTION 'Erro ao buscar informações para o utilizador %: %', user_id, SQLERRM;
  END;
END;
$$;


ALTER FUNCTION "public"."get_basic_user_info"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_listing_json"("listing_id" integer) RETURNS "jsonb"
    LANGUAGE "plpgsql"
    AS $$DECLARE
  result JSONB;
BEGIN
  BEGIN
    SELECT jsonb_strip_nulls(jsonb_build_object(
        'id', full_product_listings.id,
        'title', full_product_listings.title,
        'description', full_product_listings.description,
        'date_created', full_product_listings.date_created,
        'owner_id', full_product_listings.owner_id,
        'owner_username', profiles.username,
        'category_id', full_product_listings.category_id,
        'listing_status', full_product_listings.listing_status,
        'listing_type', full_product_listings.listing_type,
        'deposit_required', full_product_listings.deposit_required,
        'cost_per_day', full_product_listings.cost_per_day,
        'auto_close_date', full_product_listings.auto_close_date,
        'rental_duration_limit', full_product_listings.rental_duration_limit,
        'late_fee', full_product_listings.late_fee,
        'price', full_product_listings.price,
        'product_condition', full_product_listings.product_condition,
        'is_negotiable', full_product_listings.is_negotiable,
        'desired_item', full_product_listings.desired_item,
        'recipient_requirements', full_product_listings.recipient_requirements,
        'image_url', full_product_listings.main_image_url
    ))
    INTO result
    FROM full_product_listings
    Left JOIN profiles on profiles.id = full_product_listings.owner_id
    WHERE full_product_listings.id = listing_id; 

    RETURN result;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE EXCEPTION 'Erro ao buscar informações para o anúncio de ID %: %', listing_id, SQLERRM;
  END;
END;$$;


ALTER FUNCTION "public"."get_listing_json"("listing_id" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_proposal_json"("proposal_id" integer) RETURNS "jsonb"
    LANGUAGE "plpgsql"
    AS $$DECLARE
  result JSONB;
BEGIN
  BEGIN
    SELECT
      jsonb_strip_nulls(
        jsonb_build_object(
          'proposal_id', f.id,
          'title', f.title,
          'description', f.description,
          'created_at', f.created_at,
          'sender_id', f.sender_id,
          'receiver_id', f.receiver_id,
          'listing_id', f.listing_id,
          'listing_title', f.listing_title,
          'sender_name', f.sender_name,
          'sender_username', f.sender_username,
          'receiver_name', f.receiver_name,
          'receiver_username', f.receiver_username,
          'proposal_type', f.proposal_type,
          'proposal_status_id', f.proposal_status_id,
          'proposal_status', proposal_statuses.description,
          'offered_price', f.offered_price,
          'swap_with', f.swap_with,
          'message', f.message,
          'offered_rent_per_day', f.offered_rent_per_day,
          'start_date', f.start_date,
          'end_date', f.end_date
        )
      )
    INTO result
    FROM full_proposals f
    LEFT JOIN proposal_statuses ON f.proposal_status_id = proposal_statuses.id
    WHERE f.id = proposal_id;  

    RETURN result;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE EXCEPTION 'Erro ao buscar as informações da proposta com ID %: %', proposal_id, SQLERRM;
  END;
END;$$;


ALTER FUNCTION "public"."get_proposal_json"("proposal_id" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_profile"("username" "text") RETURNS "json"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$DECLARE
    result json;
BEGIN
    BEGIN
        SELECT json_build_object(
            'id', profiles.id,
            'name', profiles.name,
            'created_year', extract(year FROM auth_users.created_at),
            'active_listings', (
                SELECT count(*)
                FROM product_listings
                WHERE owner_id = profiles.id
                AND listing_status = 1
            ),
            'total_sales', (
                SELECT count(*)
                FROM transactions
                WHERE seller_id = profiles.id
            ),
            'location', locations.full_address
        ) INTO result
        FROM profiles
        LEFT JOIN auth.users AS auth_users ON profiles.id = auth_users.id
        LEFT JOIN postgis.locations AS locations ON profiles.location_id = locations.id
        WHERE profiles.username = get_user_profile.username;

        RETURN result;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE EXCEPTION 'Erro ao buscar o perfil do utilizador %: %', get_user_profile.username, SQLERRM;
    END;
END;$$;


ALTER FUNCTION "public"."get_user_profile"("username" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_proposals"("user_id" "uuid", "fetch_limit" integer, "fetch_offset" integer) RETURNS TABLE("proposal_id" integer, "title" "text", "description" "text", "sender_id" "uuid", "receiver_id" "uuid", "sender_name" "text", "receiver_name" "text", "listing_id" integer, "listing_title" "text", "proposal_type" "text", "proposal_status" "text", "swap_with" "text", "offered_price" numeric, "message" "text", "offered_rent_per_day" numeric, "start_date" "date", "end_date" "date", "created_at" timestamp without time zone, "total_count" integer)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  BEGIN
    RETURN QUERY
    SELECT 
        p.id AS proposal_id,
        p.title::text,
        p.description::text,
        p.sender_id,
        p.receiver_id,
        p.sender_name::text AS sender_name,
        p.receiver_name::text AS receiver_name,
        p.listing_id,
        p.listing_title::text AS listing_title,
        lt.description::text AS proposal_type,
        ps.description::text AS proposal_status,
        p.swap_with::text,
        p.offered_price,
        p.message::text,
        p.offered_rent_per_day,
        p.start_date,
        p.end_date,
        p.created_at,
        total.total_count
    FROM full_proposals p
    LEFT JOIN listing_types lt ON p.proposal_type_id = lt.id
    LEFT JOIN proposal_statuses ps ON p.proposal_status_id = ps.id
    CROSS JOIN (
        SELECT COUNT(*) AS total_count
        FROM full_proposals fp
        WHERE fp.sender_id = user_id OR fp.receiver_id = user_id
    ) total
    WHERE p.sender_id = user_id OR p.receiver_id = user_id
    ORDER BY p.id DESC
    LIMIT fetch_limit OFFSET fetch_offset;

  EXCEPTION
    WHEN OTHERS THEN
      RAISE EXCEPTION 'Erro ao buscar propostas para o utilizador %: %', user_id, SQLERRM;
  END;
END;
$$;


ALTER FUNCTION "public"."get_user_proposals"("user_id" "uuid", "fetch_limit" integer, "fetch_offset" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$BEGIN
  BEGIN
    INSERT INTO profiles (id, username, name, email) 
    VALUES (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'email');
    RETURN new;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE EXCEPTION 'Erro ao inserir perfil para o novo utilizador %: %', new.id, SQLERRM;
  END;
END;$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."health_check"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  return true;
end;
$$;


ALTER FUNCTION "public"."health_check"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."insert_contact"("user_id" "text", "name" "text", "description" "text", "phone_number" "text") RETURNS TABLE("contact_id" integer, "contact_name" "text", "contact_phone_number" "text", "contact_description" "text")
    LANGUAGE "plpgsql"
    AS $$BEGIN
  BEGIN
    IF (SELECT COUNT(*) FROM contacts c WHERE c.user_id = insert_contact.user_id::UUID) >= 5 THEN
      RAISE EXCEPTION 'Contact limit reached for user %', user_id;
    END IF;

    RETURN QUERY
    INSERT INTO contacts (user_id, name, description, phone_number)
    VALUES (insert_contact.user_id::UUID, insert_contact.name, insert_contact.description, insert_contact.phone_number)
    RETURNING contacts.id, contacts.name, contacts.phone_number, contacts.description;

  EXCEPTION
    WHEN OTHERS THEN
      RAISE EXCEPTION 'Erro ao processar o contato para o utilizador %: %', user_id, SQLERRM;
  END;
END;$$;


ALTER FUNCTION "public"."insert_contact"("user_id" "text", "name" "text", "description" "text", "phone_number" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."soft_delete_user"("user_id" "text") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$DECLARE
  user_uuid UUID;
BEGIN
  BEGIN
    user_uuid := user_id::UUID;

    UPDATE profiles
    SET is_deleted = TRUE, deleted_at = NOW()
    WHERE id = user_uuid;

    DELETE FROM blocked_users WHERE blocked_id = user_uuid OR blocker_id = user_uuid;

    DELETE FROM contacts c WHERE c.user_id = user_uuid;

    DELETE FROM favorites f WHERE f.user_id = user_uuid;

    UPDATE product_listings
    SET listing_status=(
      Select id from listing_statuses WHERE description = 'inactive'
    )
      WHERE owner_id = user_uuid;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE EXCEPTION 'Error deleting user %: %', user_uuid, SQLERRM;
  END;
END;$$;


ALTER FUNCTION "public"."soft_delete_user"("user_id" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_auth_metadata"("new_metadata" "jsonb", "user_id" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$DECLARE
  user_uuid UUID;
  new_email TEXT;
  filtered_metadata JSONB;
BEGIN
  user_uuid := user_id::UUID;
  new_email := new_metadata->>'email';

  -- Filter out keys with null or empty values
  SELECT jsonb_object_agg(key, value)
  INTO filtered_metadata
  FROM jsonb_each(new_metadata)
  WHERE value IS NOT NULL AND (value::TEXT <> '""');

  -- Merge only the filtered keys
  UPDATE auth.users
  SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || filtered_metadata
  WHERE id = user_uuid;

  IF new_email IS NOT NULL AND new_email <> '' THEN
    UPDATE auth.users
    SET email = new_email
    WHERE id = user_uuid;
  END IF;
END;$$;


ALTER FUNCTION "public"."update_auth_metadata"("new_metadata" "jsonb", "user_id" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_listing_image_url"("listing_id" integer, "image_url" "text") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  BEGIN
    UPDATE public.product_listings
    SET main_image_url = image_url
    WHERE id = listing_id;

  EXCEPTION
    WHEN OTHERS THEN
      RAISE EXCEPTION 'Erro ao atualizar a imagem principal do produto com ID %: %', listing_id, SQLERRM;
  END;
END;
$$;


ALTER FUNCTION "public"."update_listing_image_url"("listing_id" integer, "image_url" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_proposal_status"("proposal_id" integer, "new_status" "text", "user_id" "text") RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$DECLARE
  v_user_id UUID;
  v_listing_id INT;
  v_status_id INT;
  v_receiver_id UUID;
  v_sender_id UUID;
BEGIN
  v_user_id := user_id::UUID;

  SELECT id INTO v_status_id
  FROM proposal_statuses
  WHERE description = new_status;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Status inválido: %', new_status;
  END IF;

  SELECT receiver_id, sender_id INTO v_receiver_id, v_sender_id
  FROM proposals
  WHERE id = proposal_id;

  IF v_receiver_id IS NULL THEN
    RAISE EXCEPTION 'Proposta não encontrada ou não tem receiver';
  END IF;

  IF new_status = 'cancelled' THEN
    IF v_sender_id != v_user_id THEN
      RAISE EXCEPTION 'Utilizador não autorizado a cancelar esta proposta';
    END IF;
  ELSE
    IF v_receiver_id != v_user_id THEN
      RAISE EXCEPTION 'Utilizador não autorizado a alterar esta proposta';
    END IF;

    IF new_status = 'accepted' THEN
      SELECT listing_id INTO v_listing_id
      FROM proposals
      WHERE id = proposal_id;

      UPDATE product_listings
      SET listing_status=(
        Select id from listing_statuses WHERE listing_statuses.id=3
      )
      WHERE id = v_listing_id;

      UPDATE proposals
      SET proposal_status_id = (
        SELECT id FROM proposal_statuses WHERE description = 'rejected'
      )
      WHERE listing_id = v_listing_id
        AND id != proposal_id;
    END IF;
  END IF;

  UPDATE proposals
  SET proposal_status_id = v_status_id
  WHERE id = proposal_id;

  RETURN TRUE;
END;$$;


ALTER FUNCTION "public"."update_proposal_status"("proposal_id" integer, "new_status" "text", "user_id" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_user_data"("user_id" "text", "profile_data" "jsonb") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$DECLARE
  v_user_id UUID;
  v_email TEXT;
  v_username TEXT;
  v_name TEXT;
  v_location_id INT;
  v_user_metadata JSONB;
BEGIN
  v_user_id := user_id::UUID;

  v_email := profile_data->>'email';  
  v_username := profile_data->>'username';  
  v_name := profile_data->>'name';  
  v_location_id := (profile_data->>'location_id')::INT;

  v_user_metadata := jsonb_build_object(
        'name', v_name,
        'username', v_username,
        'email', v_email,
        'location_id', v_location_id
    );

  BEGIN
    PERFORM update_auth_metadata(v_user_metadata, user_id);
  EXCEPTION
    WHEN OTHERS THEN
      RAISE EXCEPTION 'Erro ao atualizar os metadados de autenticação para o utilizador %: %', v_user_id, SQLERRM;
  END;

  BEGIN
    UPDATE public.profiles
    SET 
      username = COALESCE(v_username, username),
      name = COALESCE(v_name, name),
      location_id = COALESCE(v_location_id, location_id),
      email = COALESCE(v_email, email)
    WHERE id = v_user_id;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE EXCEPTION 'Erro ao atualizar o perfil para o utilizador %: %', v_user_id, SQLERRM;
  END;
END;$$;


ALTER FUNCTION "public"."update_user_data"("user_id" "text", "profile_data" "jsonb") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "postgis"."locations" (
    "id" integer NOT NULL,
    "full_address" "text" NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "location" "postgis"."geography"(Point,4326) NOT NULL,
    "lat" double precision NOT NULL,
    "lon" double precision NOT NULL
);


ALTER TABLE "postgis"."locations" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "postgis"."locations_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "postgis"."locations_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "postgis"."locations_id_seq" OWNED BY "postgis"."locations"."id";



CREATE TABLE IF NOT EXISTS "public"."blocked_users" (
    "blocker_id" "uuid" NOT NULL,
    "blocked_id" "uuid" NOT NULL
);


ALTER TABLE "public"."blocked_users" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."contacts" (
    "id" integer NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "phone_number" "text" NOT NULL,
    "user_id" "uuid" NOT NULL
);


ALTER TABLE "public"."contacts" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."contacts_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."contacts_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."contacts_id_seq" OWNED BY "public"."contacts"."id";



CREATE TABLE IF NOT EXISTS "public"."favorites" (
    "user_id" "uuid" NOT NULL,
    "listing_id" integer NOT NULL
);


ALTER TABLE "public"."favorites" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_listings" (
    "id" integer NOT NULL,
    "title" "text",
    "description" "text",
    "date_created" timestamp without time zone DEFAULT "now"(),
    "owner_id" "uuid",
    "category_id" integer,
    "listing_status" integer,
    "listing_type" integer,
    "main_image_url" "text"
);


ALTER TABLE "public"."product_listings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."giveaway_listings" (
    "recipient_requirements" character varying
)
INHERITS ("public"."product_listings");


ALTER TABLE "public"."giveaway_listings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "username" "text" NOT NULL,
    "name" "text" NOT NULL,
    "location_id" integer,
    "is_deleted" boolean DEFAULT false,
    "deleted_at" timestamp with time zone,
    "email" "text" NOT NULL
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."rental_listings" (
    "deposit_required" boolean,
    "cost_per_day" numeric,
    "auto_close_date" timestamp without time zone,
    "rental_duration_limit" integer,
    "late_fee" numeric,
    "deposit_value" numeric
)
INHERITS ("public"."product_listings");


ALTER TABLE "public"."rental_listings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sale_listings" (
    "price" numeric,
    "product_condition" integer,
    "is_negotiable" boolean
)
INHERITS ("public"."product_listings");


ALTER TABLE "public"."sale_listings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."swap_listings" (
    "desired_item" character varying
)
INHERITS ("public"."product_listings");


ALTER TABLE "public"."swap_listings" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."full_product_listings" WITH ("security_invoker"='on') AS
 SELECT "r"."id",
    "r"."title",
    "r"."description",
    "r"."date_created",
    "r"."owner_id",
    "profiles"."username" AS "owner_username",
    "r"."category_id",
    "r"."listing_status",
    'rental'::"text" AS "listing_type",
    "r"."deposit_required",
    "r"."deposit_value",
    "r"."cost_per_day",
    "r"."auto_close_date",
    "r"."rental_duration_limit",
    "r"."late_fee",
    "r"."listing_type" AS "listing_type_id",
    NULL::numeric AS "price",
    NULL::integer AS "product_condition",
    NULL::boolean AS "is_negotiable",
    NULL::character varying AS "desired_item",
    NULL::character varying AS "recipient_requirements",
    "r"."main_image_url"
   FROM ("public"."rental_listings" "r"
     LEFT JOIN "public"."profiles" ON (("profiles"."id" = "r"."owner_id")))
UNION ALL
 SELECT "s"."id",
    "s"."title",
    "s"."description",
    "s"."date_created",
    "s"."owner_id",
    "profiles"."username" AS "owner_username",
    "s"."category_id",
    "s"."listing_status",
    'sale'::"text" AS "listing_type",
    NULL::boolean AS "deposit_required",
    NULL::numeric AS "deposit_value",
    NULL::numeric AS "cost_per_day",
    NULL::timestamp without time zone AS "auto_close_date",
    NULL::integer AS "rental_duration_limit",
    NULL::numeric AS "late_fee",
    "s"."listing_type" AS "listing_type_id",
    "s"."price",
    "s"."product_condition",
    "s"."is_negotiable",
    NULL::character varying AS "desired_item",
    NULL::character varying AS "recipient_requirements",
    "s"."main_image_url"
   FROM ("public"."sale_listings" "s"
     LEFT JOIN "public"."profiles" ON (("profiles"."id" = "s"."owner_id")))
UNION ALL
 SELECT "sw"."id",
    "sw"."title",
    "sw"."description",
    "sw"."date_created",
    "sw"."owner_id",
    "profiles"."username" AS "owner_username",
    "sw"."category_id",
    "sw"."listing_status",
    'swap'::"text" AS "listing_type",
    NULL::boolean AS "deposit_required",
    NULL::numeric AS "deposit_value",
    NULL::numeric AS "cost_per_day",
    NULL::timestamp without time zone AS "auto_close_date",
    NULL::integer AS "rental_duration_limit",
    NULL::numeric AS "late_fee",
    "sw"."listing_type" AS "listing_type_id",
    NULL::numeric AS "price",
    NULL::integer AS "product_condition",
    NULL::boolean AS "is_negotiable",
    "sw"."desired_item",
    NULL::character varying AS "recipient_requirements",
    "sw"."main_image_url"
   FROM ("public"."swap_listings" "sw"
     LEFT JOIN "public"."profiles" ON (("profiles"."id" = "sw"."owner_id")))
UNION ALL
 SELECT "g"."id",
    "g"."title",
    "g"."description",
    "g"."date_created",
    "g"."owner_id",
    "profiles"."username" AS "owner_username",
    "g"."category_id",
    "g"."listing_status",
    'giveaway'::"text" AS "listing_type",
    NULL::boolean AS "deposit_required",
    NULL::numeric AS "deposit_value",
    NULL::numeric AS "cost_per_day",
    NULL::timestamp without time zone AS "auto_close_date",
    NULL::integer AS "rental_duration_limit",
    NULL::numeric AS "late_fee",
    "g"."listing_type" AS "listing_type_id",
    NULL::numeric AS "price",
    NULL::integer AS "product_condition",
    NULL::boolean AS "is_negotiable",
    NULL::character varying AS "desired_item",
    "g"."recipient_requirements",
    "g"."main_image_url"
   FROM ("public"."giveaway_listings" "g"
     LEFT JOIN "public"."profiles" ON (("profiles"."id" = "g"."owner_id")));


ALTER TABLE "public"."full_product_listings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."proposals" (
    "id" integer NOT NULL,
    "title" character varying(255),
    "description" character varying(255),
    "sender_id" "uuid",
    "receiver_id" "uuid",
    "listing_id" integer,
    "proposal_type_id" integer,
    "proposal_status_id" integer DEFAULT 1,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."proposals" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."proposals_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."proposals_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."proposals_id_seq" OWNED BY "public"."proposals"."id";



CREATE TABLE IF NOT EXISTS "public"."giveaway_proposals" (
    "id" integer DEFAULT "nextval"('"public"."proposals_id_seq"'::"regclass"),
    "message" character varying
)
INHERITS ("public"."proposals");


ALTER TABLE "public"."giveaway_proposals" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."proposal_statuses" (
    "id" integer NOT NULL,
    "description" character varying(255)
);


ALTER TABLE "public"."proposal_statuses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."rental_proposals" (
    "id" integer DEFAULT "nextval"('"public"."proposals_id_seq"'::"regclass"),
    "offered_rent_per_day" numeric,
    "start_date" timestamp without time zone,
    "end_date" timestamp without time zone
)
INHERITS ("public"."proposals");


ALTER TABLE "public"."rental_proposals" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sale_proposals" (
    "id" integer DEFAULT "nextval"('"public"."proposals_id_seq"'::"regclass"),
    "offered_price" numeric
)
INHERITS ("public"."proposals");


ALTER TABLE "public"."sale_proposals" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."swap_proposals" (
    "id" integer DEFAULT "nextval"('"public"."proposals_id_seq"'::"regclass"),
    "swap_with" character varying
)
INHERITS ("public"."proposals");


ALTER TABLE "public"."swap_proposals" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."full_proposals" WITH ("security_invoker"='on') AS
 SELECT "sp"."id",
    "sp"."title",
    "sp"."description",
    "sp"."sender_id",
    "sp"."receiver_id",
    "sp"."listing_id",
    "sp"."proposal_type_id",
    "sp"."proposal_status_id",
    "sp"."created_at",
    'sale'::"text" AS "proposal_type",
    "sp"."offered_price",
    NULL::character varying AS "swap_with",
    NULL::character varying AS "message",
    NULL::numeric AS "offered_rent_per_day",
    NULL::timestamp without time zone AS "start_date",
    NULL::timestamp without time zone AS "end_date",
    "sender"."name" AS "sender_name",
    "sender"."username" AS "sender_username",
    "receiver"."name" AS "receiver_name",
    "receiver"."username" AS "receiver_username",
    "pl"."title" AS "listing_title",
    "ps"."description" AS "proposal_status"
   FROM (((("public"."sale_proposals" "sp"
     JOIN "public"."profiles" "sender" ON (("sender"."id" = "sp"."sender_id")))
     JOIN "public"."profiles" "receiver" ON (("receiver"."id" = "sp"."receiver_id")))
     JOIN "public"."product_listings" "pl" ON (("pl"."id" = "sp"."listing_id")))
     JOIN "public"."proposal_statuses" "ps" ON (("ps"."id" = "sp"."proposal_status_id")))
UNION ALL
 SELECT "sw"."id",
    "sw"."title",
    "sw"."description",
    "sw"."sender_id",
    "sw"."receiver_id",
    "sw"."listing_id",
    "sw"."proposal_type_id",
    "sw"."proposal_status_id",
    "sw"."created_at",
    'swap'::"text" AS "proposal_type",
    NULL::numeric AS "offered_price",
    "sw"."swap_with",
    NULL::character varying AS "message",
    NULL::numeric AS "offered_rent_per_day",
    NULL::timestamp without time zone AS "start_date",
    NULL::timestamp without time zone AS "end_date",
    "sender"."name" AS "sender_name",
    "sender"."username" AS "sender_username",
    "receiver"."name" AS "receiver_name",
    "receiver"."username" AS "receiver_username",
    "pl"."title" AS "listing_title",
    "ps"."description" AS "proposal_status"
   FROM (((("public"."swap_proposals" "sw"
     JOIN "public"."profiles" "sender" ON (("sender"."id" = "sw"."sender_id")))
     JOIN "public"."profiles" "receiver" ON (("receiver"."id" = "sw"."receiver_id")))
     JOIN "public"."product_listings" "pl" ON (("pl"."id" = "sw"."listing_id")))
     JOIN "public"."proposal_statuses" "ps" ON (("ps"."id" = "sw"."proposal_status_id")))
UNION ALL
 SELECT "g"."id",
    "g"."title",
    "g"."description",
    "g"."sender_id",
    "g"."receiver_id",
    "g"."listing_id",
    "g"."proposal_type_id",
    "g"."proposal_status_id",
    "g"."created_at",
    'giveaway'::"text" AS "proposal_type",
    NULL::numeric AS "offered_price",
    NULL::character varying AS "swap_with",
    "g"."message",
    NULL::numeric AS "offered_rent_per_day",
    NULL::timestamp without time zone AS "start_date",
    NULL::timestamp without time zone AS "end_date",
    "sender"."name" AS "sender_name",
    "sender"."username" AS "sender_username",
    "receiver"."name" AS "receiver_name",
    "receiver"."username" AS "receiver_username",
    "pl"."title" AS "listing_title",
    "ps"."description" AS "proposal_status"
   FROM (((("public"."giveaway_proposals" "g"
     JOIN "public"."profiles" "sender" ON (("sender"."id" = "g"."sender_id")))
     JOIN "public"."profiles" "receiver" ON (("receiver"."id" = "g"."receiver_id")))
     JOIN "public"."product_listings" "pl" ON (("pl"."id" = "g"."listing_id")))
     JOIN "public"."proposal_statuses" "ps" ON (("ps"."id" = "g"."proposal_status_id")))
UNION ALL
 SELECT "r"."id",
    "r"."title",
    "r"."description",
    "r"."sender_id",
    "r"."receiver_id",
    "r"."listing_id",
    "r"."proposal_type_id",
    "r"."proposal_status_id",
    "r"."created_at",
    'rental'::"text" AS "proposal_type",
    NULL::numeric AS "offered_price",
    NULL::character varying AS "swap_with",
    NULL::character varying AS "message",
    "r"."offered_rent_per_day",
    "r"."start_date",
    "r"."end_date",
    "sender"."name" AS "sender_name",
    "sender"."username" AS "sender_username",
    "receiver"."name" AS "receiver_name",
    "receiver"."username" AS "receiver_username",
    "pl"."title" AS "listing_title",
    "ps"."description" AS "proposal_status"
   FROM (((("public"."rental_proposals" "r"
     JOIN "public"."profiles" "sender" ON (("sender"."id" = "r"."sender_id")))
     JOIN "public"."profiles" "receiver" ON (("receiver"."id" = "r"."receiver_id")))
     JOIN "public"."product_listings" "pl" ON (("pl"."id" = "r"."listing_id")))
     JOIN "public"."proposal_statuses" "ps" ON (("ps"."id" = "r"."proposal_status_id")));


ALTER TABLE "public"."full_proposals" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."listing_statuses" (
    "id" integer NOT NULL,
    "description" character varying(255)
);


ALTER TABLE "public"."listing_statuses" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."listing_statuses_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."listing_statuses_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."listing_statuses_id_seq" OWNED BY "public"."listing_statuses"."id";



CREATE TABLE IF NOT EXISTS "public"."listing_types" (
    "id" integer NOT NULL,
    "description" character varying(255)
);


ALTER TABLE "public"."listing_types" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."password_reset_tokens" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "token" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "expires_at" timestamp with time zone NOT NULL,
    "used" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."password_reset_tokens" OWNER TO "postgres";


COMMENT ON TABLE "public"."password_reset_tokens" IS 'Contains the tokens generated for resetting a password.';



CREATE TABLE IF NOT EXISTS "public"."product_categories" (
    "id" integer NOT NULL,
    "category" character varying(255) NOT NULL
);


ALTER TABLE "public"."product_categories" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."product_categories_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."product_categories_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."product_categories_id_seq" OWNED BY "public"."product_categories"."id";



CREATE TABLE IF NOT EXISTS "public"."product_conditions" (
    "id" bigint NOT NULL,
    "condition" "text" DEFAULT ''::"text" NOT NULL
);


ALTER TABLE "public"."product_conditions" OWNER TO "postgres";


ALTER TABLE "public"."product_conditions" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."product_conditions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE SEQUENCE IF NOT EXISTS "public"."product_listings_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."product_listings_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."product_listings_id_seq" OWNED BY "public"."product_listings"."id";



CREATE SEQUENCE IF NOT EXISTS "public"."proposal_statuses_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."proposal_statuses_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."proposal_statuses_id_seq" OWNED BY "public"."proposal_statuses"."id";



CREATE SEQUENCE IF NOT EXISTS "public"."proposal_types_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."proposal_types_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."proposal_types_id_seq" OWNED BY "public"."listing_types"."id";



CREATE TABLE IF NOT EXISTS "public"."rental_availability" (
    "id" integer NOT NULL,
    "rental_listing_id" integer,
    "start_date" timestamp without time zone,
    "end_date" timestamp without time zone
);


ALTER TABLE "public"."rental_availability" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."rental_availability_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."rental_availability_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."rental_availability_id_seq" OWNED BY "public"."rental_availability"."id";



CREATE TABLE IF NOT EXISTS "public"."transaction_statuses" (
    "id" integer NOT NULL,
    "description" character varying(255)
);


ALTER TABLE "public"."transaction_statuses" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."transaction_statuses_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."transaction_statuses_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."transaction_statuses_id_seq" OWNED BY "public"."transaction_statuses"."id";



CREATE TABLE IF NOT EXISTS "public"."transactions" (
    "id" integer NOT NULL,
    "date_created" timestamp without time zone DEFAULT "now"(),
    "transaction_status" integer,
    "listing_id" integer,
    "proposal_id" integer,
    "seller_id" "uuid",
    "buyer_id" "uuid"
);


ALTER TABLE "public"."transactions" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."transactions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."transactions_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."transactions_id_seq" OWNED BY "public"."transactions"."id";



ALTER TABLE ONLY "postgis"."locations" ALTER COLUMN "id" SET DEFAULT "nextval"('"postgis"."locations_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."contacts" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."contacts_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."giveaway_listings" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."product_listings_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."giveaway_listings" ALTER COLUMN "date_created" SET DEFAULT "now"();



ALTER TABLE ONLY "public"."giveaway_proposals" ALTER COLUMN "proposal_status_id" SET DEFAULT 1;



ALTER TABLE ONLY "public"."giveaway_proposals" ALTER COLUMN "created_at" SET DEFAULT "now"();



ALTER TABLE ONLY "public"."listing_statuses" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."listing_statuses_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."listing_types" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."proposal_types_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."product_categories" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."product_categories_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."product_listings" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."product_listings_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."proposal_statuses" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."proposal_statuses_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."proposals" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."proposals_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."rental_availability" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."rental_availability_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."rental_listings" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."product_listings_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."rental_listings" ALTER COLUMN "date_created" SET DEFAULT "now"();



ALTER TABLE ONLY "public"."rental_proposals" ALTER COLUMN "proposal_status_id" SET DEFAULT 1;



ALTER TABLE ONLY "public"."rental_proposals" ALTER COLUMN "created_at" SET DEFAULT "now"();



ALTER TABLE ONLY "public"."sale_listings" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."product_listings_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."sale_listings" ALTER COLUMN "date_created" SET DEFAULT "now"();



ALTER TABLE ONLY "public"."sale_proposals" ALTER COLUMN "proposal_status_id" SET DEFAULT 1;



ALTER TABLE ONLY "public"."sale_proposals" ALTER COLUMN "created_at" SET DEFAULT "now"();



ALTER TABLE ONLY "public"."swap_listings" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."product_listings_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."swap_listings" ALTER COLUMN "date_created" SET DEFAULT "now"();



ALTER TABLE ONLY "public"."swap_proposals" ALTER COLUMN "proposal_status_id" SET DEFAULT 1;



ALTER TABLE ONLY "public"."swap_proposals" ALTER COLUMN "created_at" SET DEFAULT "now"();



ALTER TABLE ONLY "public"."transaction_statuses" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."transaction_statuses_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."transactions" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."transactions_id_seq"'::"regclass");



ALTER TABLE ONLY "postgis"."locations"
    ADD CONSTRAINT "locations_location_key" UNIQUE ("location");



ALTER TABLE ONLY "postgis"."locations"
    ADD CONSTRAINT "locations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."blocked_users"
    ADD CONSTRAINT "blocked_users_pkey" PRIMARY KEY ("blocker_id", "blocked_id");



ALTER TABLE ONLY "public"."contacts"
    ADD CONSTRAINT "contacts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."favorites"
    ADD CONSTRAINT "favorites_pkey" PRIMARY KEY ("user_id", "listing_id");



ALTER TABLE ONLY "public"."listing_statuses"
    ADD CONSTRAINT "listing_statuses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."password_reset_tokens"
    ADD CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_categories"
    ADD CONSTRAINT "product_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_conditions"
    ADD CONSTRAINT "product_conditions_id_key" UNIQUE ("id");



ALTER TABLE ONLY "public"."product_conditions"
    ADD CONSTRAINT "product_conditions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_listings"
    ADD CONSTRAINT "product_listings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."proposal_statuses"
    ADD CONSTRAINT "proposal_statuses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."listing_types"
    ADD CONSTRAINT "proposal_types_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."proposals"
    ADD CONSTRAINT "proposals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."rental_availability"
    ADD CONSTRAINT "rental_availability_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."transaction_statuses"
    ADD CONSTRAINT "transaction_statuses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "users_username_key" UNIQUE ("username");



CREATE INDEX "idx_username" ON "public"."profiles" USING "btree" ("username");



CREATE OR REPLACE TRIGGER "cleanup_used_reset_tokens" AFTER UPDATE ON "public"."password_reset_tokens" FOR EACH ROW WHEN (("new"."used" = true)) EXECUTE FUNCTION "public"."delete_used_reset_tokens"();



ALTER TABLE ONLY "public"."blocked_users"
    ADD CONSTRAINT "fk_blockeduser_blocked" FOREIGN KEY ("blocked_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."blocked_users"
    ADD CONSTRAINT "fk_blockeduser_blocker" FOREIGN KEY ("blocker_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."contacts"
    ADD CONSTRAINT "fk_contact_user" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."favorites"
    ADD CONSTRAINT "fk_favorite_listing" FOREIGN KEY ("listing_id") REFERENCES "public"."product_listings"("id");



ALTER TABLE ONLY "public"."favorites"
    ADD CONSTRAINT "fk_favorite_user" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."product_listings"
    ADD CONSTRAINT "fk_productlisting_category" FOREIGN KEY ("category_id") REFERENCES "public"."product_categories"("id");



ALTER TABLE ONLY "public"."product_listings"
    ADD CONSTRAINT "fk_productlisting_owner" FOREIGN KEY ("owner_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."product_listings"
    ADD CONSTRAINT "fk_productlisting_status" FOREIGN KEY ("listing_status") REFERENCES "public"."listing_statuses"("id");



ALTER TABLE ONLY "public"."proposals"
    ADD CONSTRAINT "fk_proposal_listing" FOREIGN KEY ("listing_id") REFERENCES "public"."product_listings"("id");



ALTER TABLE ONLY "public"."proposals"
    ADD CONSTRAINT "fk_proposal_receiver" FOREIGN KEY ("receiver_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."proposals"
    ADD CONSTRAINT "fk_proposal_sender" FOREIGN KEY ("sender_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."proposals"
    ADD CONSTRAINT "fk_proposal_status" FOREIGN KEY ("proposal_status_id") REFERENCES "public"."proposal_statuses"("id");



ALTER TABLE ONLY "public"."proposals"
    ADD CONSTRAINT "fk_proposal_type" FOREIGN KEY ("proposal_type_id") REFERENCES "public"."listing_types"("id");



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "fk_transaction_listing" FOREIGN KEY ("listing_id") REFERENCES "public"."product_listings"("id");



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "fk_transaction_proposal" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id");



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "fk_transaction_status" FOREIGN KEY ("transaction_status") REFERENCES "public"."transaction_statuses"("id");



ALTER TABLE ONLY "public"."password_reset_tokens"
    ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."product_listings"
    ADD CONSTRAINT "product_listings_listing_type_fkey" FOREIGN KEY ("listing_type") REFERENCES "public"."listing_types"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "postgis"."locations"("id");



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "public"."profiles"("id");



CREATE POLICY "Enable read access for all users" ON "postgis"."locations" FOR SELECT TO "service_role" USING (true);



CREATE POLICY "test" ON "postgis"."locations" TO "anon" USING (true) WITH CHECK (true);



CREATE POLICY "Enable authenticated user to update its profile data" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Enable insert for authenticated users only" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable read access for all users" ON "public"."listing_statuses" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."product_categories" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."product_conditions" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."product_listings" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."profiles" FOR SELECT USING (true);



ALTER TABLE "public"."blocked_users" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."contacts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."favorites" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "getContacts" ON "public"."contacts" FOR SELECT USING (("user_id" = "user_id"));



ALTER TABLE "public"."giveaway_listings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."giveaway_proposals" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."listing_statuses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."listing_types" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."password_reset_tokens" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_conditions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_listings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."proposal_statuses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."proposals" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."rental_availability" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."rental_listings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."rental_proposals" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sale_listings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sale_proposals" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."swap_listings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."swap_proposals" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."transaction_statuses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."transactions" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "postgis" TO "anon";
GRANT USAGE ON SCHEMA "postgis" TO "authenticated";
GRANT USAGE ON SCHEMA "postgis" TO "service_role";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";




















































































































































































GRANT ALL ON FUNCTION "public"."calculate_user_balance"("user_id" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_user_balance"("user_id" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_user_balance"("user_id" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_listing"("title" "text", "description" "text", "category" "text", "listing_type" "text", "user_id" "text", "product_condition" "text", "price" numeric, "is_negotiable" boolean, "deposit_required" boolean, "deposit_value" numeric, "cost_per_day" numeric, "auto_close_date" "date", "rental_duration_limit" integer, "late_fee" numeric, "desired_item" "text", "recipient_requirements" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_listing"("title" "text", "description" "text", "category" "text", "listing_type" "text", "user_id" "text", "product_condition" "text", "price" numeric, "is_negotiable" boolean, "deposit_required" boolean, "deposit_value" numeric, "cost_per_day" numeric, "auto_close_date" "date", "rental_duration_limit" integer, "late_fee" numeric, "desired_item" "text", "recipient_requirements" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_listing"("title" "text", "description" "text", "category" "text", "listing_type" "text", "user_id" "text", "product_condition" "text", "price" numeric, "is_negotiable" boolean, "deposit_required" boolean, "deposit_value" numeric, "cost_per_day" numeric, "auto_close_date" "date", "rental_duration_limit" integer, "late_fee" numeric, "desired_item" "text", "recipient_requirements" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_location_and_update_profile"("user_id" "text", "address" "text", "latitude" double precision, "longitude" double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."create_location_and_update_profile"("user_id" "text", "address" "text", "latitude" double precision, "longitude" double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_location_and_update_profile"("user_id" "text", "address" "text", "latitude" double precision, "longitude" double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."create_proposal"("title" "text", "description" "text", "listing_id" integer, "proposal_type" "text", "proposal_status" "text", "sender_id" "text", "receiver_id" "text", "offered_price" numeric, "offered_rent_per_day" numeric, "start_date" "date", "end_date" "date", "message" "text", "swap_with" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_proposal"("title" "text", "description" "text", "listing_id" integer, "proposal_type" "text", "proposal_status" "text", "sender_id" "text", "receiver_id" "text", "offered_price" numeric, "offered_rent_per_day" numeric, "start_date" "date", "end_date" "date", "message" "text", "swap_with" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_proposal"("title" "text", "description" "text", "listing_id" integer, "proposal_type" "text", "proposal_status" "text", "sender_id" "text", "receiver_id" "text", "offered_price" numeric, "offered_rent_per_day" numeric, "start_date" "date", "end_date" "date", "message" "text", "swap_with" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_used_reset_tokens"() TO "anon";
GRANT ALL ON FUNCTION "public"."delete_used_reset_tokens"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_used_reset_tokens"() TO "service_role";



GRANT ALL ON FUNCTION "public"."fetch_favorites"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."fetch_favorites"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."fetch_favorites"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."fetch_filtered_proposals"("user_id" "uuid", "fetch_limit" integer, "fetch_page" integer, "received" boolean, "sent" boolean, "accepted" boolean, "rejected" boolean, "cancelled" boolean, "pending" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."fetch_filtered_proposals"("user_id" "uuid", "fetch_limit" integer, "fetch_page" integer, "received" boolean, "sent" boolean, "accepted" boolean, "rejected" boolean, "cancelled" boolean, "pending" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."fetch_filtered_proposals"("user_id" "uuid", "fetch_limit" integer, "fetch_page" integer, "received" boolean, "sent" boolean, "accepted" boolean, "rejected" boolean, "cancelled" boolean, "pending" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."fetch_home_listings"("fetch_limit" integer, "fetch_offset" integer, "listing_type" "text", "search" "text", "lat" double precision, "lon" double precision, "dist" double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."fetch_home_listings"("fetch_limit" integer, "fetch_offset" integer, "listing_type" "text", "search" "text", "lat" double precision, "lon" double precision, "dist" double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."fetch_home_listings"("fetch_limit" integer, "fetch_offset" integer, "listing_type" "text", "search" "text", "lat" double precision, "lon" double precision, "dist" double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."fetch_user_listings"("owner_id" "uuid", "fetch_limit" integer, "fetch_offset" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."fetch_user_listings"("owner_id" "uuid", "fetch_limit" integer, "fetch_offset" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."fetch_user_listings"("owner_id" "uuid", "fetch_limit" integer, "fetch_offset" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."fetch_user_location"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."fetch_user_location"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."fetch_user_location"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_basic_user_info"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_basic_user_info"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_basic_user_info"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_listing_json"("listing_id" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_listing_json"("listing_id" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_listing_json"("listing_id" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_proposal_json"("proposal_id" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_proposal_json"("proposal_id" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_proposal_json"("proposal_id" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_profile"("username" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_profile"("username" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_profile"("username" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_proposals"("user_id" "uuid", "fetch_limit" integer, "fetch_offset" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_proposals"("user_id" "uuid", "fetch_limit" integer, "fetch_offset" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_proposals"("user_id" "uuid", "fetch_limit" integer, "fetch_offset" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."health_check"() TO "anon";
GRANT ALL ON FUNCTION "public"."health_check"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."health_check"() TO "service_role";



GRANT ALL ON FUNCTION "public"."insert_contact"("user_id" "text", "name" "text", "description" "text", "phone_number" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."insert_contact"("user_id" "text", "name" "text", "description" "text", "phone_number" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."insert_contact"("user_id" "text", "name" "text", "description" "text", "phone_number" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."soft_delete_user"("user_id" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."soft_delete_user"("user_id" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."soft_delete_user"("user_id" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_auth_metadata"("new_metadata" "jsonb", "user_id" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."update_auth_metadata"("new_metadata" "jsonb", "user_id" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_auth_metadata"("new_metadata" "jsonb", "user_id" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_listing_image_url"("listing_id" integer, "image_url" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."update_listing_image_url"("listing_id" integer, "image_url" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_listing_image_url"("listing_id" integer, "image_url" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_proposal_status"("proposal_id" integer, "new_status" "text", "user_id" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."update_proposal_status"("proposal_id" integer, "new_status" "text", "user_id" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_proposal_status"("proposal_id" integer, "new_status" "text", "user_id" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_user_data"("user_id" "text", "profile_data" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."update_user_data"("user_id" "text", "profile_data" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_user_data"("user_id" "text", "profile_data" "jsonb") TO "service_role";


















GRANT SELECT ON TABLE "postgis"."locations" TO "service_role";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "postgis"."locations" TO "anon";



GRANT SELECT,USAGE ON SEQUENCE "postgis"."locations_id_seq" TO "anon";



GRANT ALL ON TABLE "public"."blocked_users" TO "anon";
GRANT ALL ON TABLE "public"."blocked_users" TO "authenticated";
GRANT ALL ON TABLE "public"."blocked_users" TO "service_role";



GRANT ALL ON TABLE "public"."contacts" TO "anon";
GRANT ALL ON TABLE "public"."contacts" TO "authenticated";
GRANT ALL ON TABLE "public"."contacts" TO "service_role";



GRANT ALL ON SEQUENCE "public"."contacts_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."contacts_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."contacts_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."favorites" TO "anon";
GRANT ALL ON TABLE "public"."favorites" TO "authenticated";
GRANT ALL ON TABLE "public"."favorites" TO "service_role";



GRANT ALL ON TABLE "public"."product_listings" TO "anon";
GRANT ALL ON TABLE "public"."product_listings" TO "authenticated";
GRANT ALL ON TABLE "public"."product_listings" TO "service_role";



GRANT ALL ON TABLE "public"."giveaway_listings" TO "anon";
GRANT ALL ON TABLE "public"."giveaway_listings" TO "authenticated";
GRANT ALL ON TABLE "public"."giveaway_listings" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."rental_listings" TO "anon";
GRANT ALL ON TABLE "public"."rental_listings" TO "authenticated";
GRANT ALL ON TABLE "public"."rental_listings" TO "service_role";



GRANT ALL ON TABLE "public"."sale_listings" TO "anon";
GRANT ALL ON TABLE "public"."sale_listings" TO "authenticated";
GRANT ALL ON TABLE "public"."sale_listings" TO "service_role";



GRANT ALL ON TABLE "public"."swap_listings" TO "anon";
GRANT ALL ON TABLE "public"."swap_listings" TO "authenticated";
GRANT ALL ON TABLE "public"."swap_listings" TO "service_role";



GRANT ALL ON TABLE "public"."full_product_listings" TO "anon";
GRANT ALL ON TABLE "public"."full_product_listings" TO "authenticated";
GRANT ALL ON TABLE "public"."full_product_listings" TO "service_role";



GRANT ALL ON TABLE "public"."proposals" TO "anon";
GRANT ALL ON TABLE "public"."proposals" TO "authenticated";
GRANT ALL ON TABLE "public"."proposals" TO "service_role";



GRANT ALL ON SEQUENCE "public"."proposals_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."proposals_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."proposals_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."giveaway_proposals" TO "anon";
GRANT ALL ON TABLE "public"."giveaway_proposals" TO "authenticated";
GRANT ALL ON TABLE "public"."giveaway_proposals" TO "service_role";



GRANT ALL ON TABLE "public"."proposal_statuses" TO "anon";
GRANT ALL ON TABLE "public"."proposal_statuses" TO "authenticated";
GRANT ALL ON TABLE "public"."proposal_statuses" TO "service_role";



GRANT ALL ON TABLE "public"."rental_proposals" TO "anon";
GRANT ALL ON TABLE "public"."rental_proposals" TO "authenticated";
GRANT ALL ON TABLE "public"."rental_proposals" TO "service_role";



GRANT ALL ON TABLE "public"."sale_proposals" TO "anon";
GRANT ALL ON TABLE "public"."sale_proposals" TO "authenticated";
GRANT ALL ON TABLE "public"."sale_proposals" TO "service_role";



GRANT ALL ON TABLE "public"."swap_proposals" TO "anon";
GRANT ALL ON TABLE "public"."swap_proposals" TO "authenticated";
GRANT ALL ON TABLE "public"."swap_proposals" TO "service_role";



GRANT ALL ON TABLE "public"."full_proposals" TO "anon";
GRANT ALL ON TABLE "public"."full_proposals" TO "authenticated";
GRANT ALL ON TABLE "public"."full_proposals" TO "service_role";



GRANT ALL ON TABLE "public"."listing_statuses" TO "anon";
GRANT ALL ON TABLE "public"."listing_statuses" TO "authenticated";
GRANT ALL ON TABLE "public"."listing_statuses" TO "service_role";



GRANT ALL ON SEQUENCE "public"."listing_statuses_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."listing_statuses_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."listing_statuses_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."listing_types" TO "anon";
GRANT ALL ON TABLE "public"."listing_types" TO "authenticated";
GRANT ALL ON TABLE "public"."listing_types" TO "service_role";



GRANT ALL ON TABLE "public"."password_reset_tokens" TO "anon";
GRANT ALL ON TABLE "public"."password_reset_tokens" TO "authenticated";
GRANT ALL ON TABLE "public"."password_reset_tokens" TO "service_role";



GRANT ALL ON TABLE "public"."product_categories" TO "anon";
GRANT ALL ON TABLE "public"."product_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."product_categories" TO "service_role";



GRANT ALL ON SEQUENCE "public"."product_categories_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."product_categories_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."product_categories_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."product_conditions" TO "anon";
GRANT ALL ON TABLE "public"."product_conditions" TO "authenticated";
GRANT ALL ON TABLE "public"."product_conditions" TO "service_role";



GRANT ALL ON SEQUENCE "public"."product_conditions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."product_conditions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."product_conditions_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."product_listings_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."product_listings_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."product_listings_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."proposal_statuses_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."proposal_statuses_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."proposal_statuses_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."proposal_types_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."proposal_types_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."proposal_types_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."rental_availability" TO "anon";
GRANT ALL ON TABLE "public"."rental_availability" TO "authenticated";
GRANT ALL ON TABLE "public"."rental_availability" TO "service_role";



GRANT ALL ON SEQUENCE "public"."rental_availability_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."rental_availability_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."rental_availability_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."transaction_statuses" TO "anon";
GRANT ALL ON TABLE "public"."transaction_statuses" TO "authenticated";
GRANT ALL ON TABLE "public"."transaction_statuses" TO "service_role";



GRANT ALL ON SEQUENCE "public"."transaction_statuses_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."transaction_statuses_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."transaction_statuses_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."transactions" TO "anon";
GRANT ALL ON TABLE "public"."transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."transactions" TO "service_role";



GRANT ALL ON SEQUENCE "public"."transactions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."transactions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."transactions_id_seq" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
