-- Table: location
CREATE TABLE location (
    id SERIAL PRIMARY KEY,
    city VARCHAR(255),
    country VARCHAR(255)
);

-- Table: users
CREATE TABLE users (
    id UUID PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    location_id INT,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP,
    CONSTRAINT fk_user_location FOREIGN KEY (location_id) REFERENCES location(id)
);

-- Table: contacts
CREATE TABLE contacts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    phone_number VARCHAR(255) NOT NULL,
    user_id UUID,
    CONSTRAINT fk_contact_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Table: blocked_users
CREATE TABLE blocked_users (
    blocker_id UUID,
    blocked_id UUID,
    PRIMARY KEY (blocker_id, blocked_id),
    CONSTRAINT fk_blockeduser_blocker FOREIGN KEY (blocker_id) REFERENCES users(id),
    CONSTRAINT fk_blockeduser_blocked FOREIGN KEY (blocked_id) REFERENCES users(id)
);

-- Table: product_categories
CREATE TABLE product_categories (
    id SERIAL PRIMARY KEY,
    category VARCHAR(255)
);

-- Table: listing_statuses
CREATE TABLE listing_statuses (
    id SERIAL PRIMARY KEY,
    description VARCHAR(255)
);

-- Table: product_listings
CREATE TABLE product_listings (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    description VARCHAR(255),
    date_created TIMESTAMP DEFAULT NOW(),
    owner_id UUID,
    category_id INT,
    listing_status INT,
    CONSTRAINT fk_productlisting_owner FOREIGN KEY (owner_id) REFERENCES users(id),
    CONSTRAINT fk_productlisting_category FOREIGN KEY (category_id) REFERENCES product_categories(id),
    CONSTRAINT fk_productlisting_status FOREIGN KEY (listing_status) REFERENCES listing_statuses(id)
);

-- Table: product_images
CREATE TABLE product_images (
    product_listing_id INT,
    image_path VARCHAR(255),
    PRIMARY KEY (product_listing_id, image_path),
    CONSTRAINT fk_productimage_listing FOREIGN KEY (product_listing_id) REFERENCES product_listings(id)
);

-- Table: swap_listings
CREATE TABLE swap_listings (
    id SERIAL PRIMARY KEY,
    desired_item VARCHAR(255),
    CONSTRAINT fk_swaplisting_product FOREIGN KEY (id) REFERENCES product_listings(id)
);

-- Table: sale_listings
CREATE TABLE sale_listings (
    id SERIAL PRIMARY KEY,
    price NUMERIC(19, 0),
    product_condition VARCHAR(255),
    is_negotiable BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_salelisting_product FOREIGN KEY (id) REFERENCES product_listings(id)
);

-- Table: giveaway_listings
CREATE TABLE giveaway_listings (
    id SERIAL PRIMARY KEY,
    recipient_requirements VARCHAR(255),
    CONSTRAINT fk_giveawaylisting_product FOREIGN KEY (id) REFERENCES product_listings(id)
);

-- Table: rental_listings
CREATE TABLE rental_listings (
    id SERIAL PRIMARY KEY,
    deposit_required BOOLEAN DEFAULT FALSE,
    cost_per_day NUMERIC(19, 0),
    auto_close_date TIMESTAMP,
    rental_duration_limit INT,
    late_fee NUMERIC(19, 0),
    CONSTRAINT fk_rentallisting_product FOREIGN KEY (id) REFERENCES product_listings(id)
);

-- Table: rental_availability
CREATE TABLE rental_availability (
    id SERIAL PRIMARY KEY,
    rental_listing_id INT,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    CONSTRAINT fk_rentalavailability_listing FOREIGN KEY (rental_listing_id) REFERENCES rental_listings(id)
);

-- Table: favorites
CREATE TABLE favorites (
    user_id UUID,
    listing_id INT,
    PRIMARY KEY (user_id, listing_id),
    CONSTRAINT fk_favorite_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_favorite_listing FOREIGN KEY (listing_id) REFERENCES product_listings(id)
);

-- Table: proposal_types
CREATE TABLE proposal_types (
    id SERIAL PRIMARY KEY,
    description VARCHAR(255)
);

-- Table: proposal_statuses
CREATE TABLE proposal_statuses (
    id SERIAL PRIMARY KEY,
    description VARCHAR(255)
);

-- Table: proposals
CREATE TABLE proposals (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    description VARCHAR(255),
    sender_id UUID,
    receiver_id UUID,
    listing_id INT,
    proposal_type_id INT,
    proposal_status_id INT,
    CONSTRAINT fk_proposal_sender FOREIGN KEY (sender_id) REFERENCES users(id),
    CONSTRAINT fk_proposal_receiver FOREIGN KEY (receiver_id) REFERENCES users(id),
    CONSTRAINT fk_proposal_listing FOREIGN KEY (listing_id) REFERENCES product_listings(id),
    CONSTRAINT fk_proposal_type FOREIGN KEY (proposal_type_id) REFERENCES proposal_types(id),
    CONSTRAINT fk_proposal_status FOREIGN KEY (proposal_status_id) REFERENCES proposal_statuses(id)
);

-- Table: swap_proposals
CREATE TABLE swap_proposals (
    id SERIAL PRIMARY KEY,
    swap_with VARCHAR(255),
    CONSTRAINT fk_swapproposal_proposal FOREIGN KEY (id) REFERENCES proposals(id)
);

-- Table: sale_proposals
CREATE TABLE sale_proposals (
    id SERIAL PRIMARY KEY,
    offered_price NUMERIC(19, 0),
    CONSTRAINT fk_saleproposal_proposal FOREIGN KEY (id) REFERENCES proposals(id)
);

-- Table: giveaway_proposals
CREATE TABLE giveaway_proposals (
    id SERIAL PRIMARY KEY,
    message VARCHAR(255),
    CONSTRAINT fk_giveawayproposal_proposal FOREIGN KEY (id) REFERENCES proposals(id)
);

-- Table: rental_proposals
CREATE TABLE rental_proposals (
    id SERIAL PRIMARY KEY,
    offered_rent_per_day NUMERIC(19, 0),
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    CONSTRAINT fk_rentalproposal_proposal FOREIGN KEY (id) REFERENCES proposals(id)
);

-- Table: transaction_statuses
CREATE TABLE transaction_statuses (
    id SERIAL PRIMARY KEY,
    description VARCHAR(255)
);

-- Table: transactions
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    date_created TIMESTAMP DEFAULT NOW(),
    transaction_status INT,
    listing_id INT,
    proposal_id INT,
    user_id UUID,
    CONSTRAINT fk_transaction_status FOREIGN KEY (transaction_status) REFERENCES transaction_statuses(id),
    CONSTRAINT fk_transaction_listing FOREIGN KEY (listing_id) REFERENCES product_listings(id),
    CONSTRAINT fk_transaction_proposal FOREIGN KEY (proposal_id) REFERENCES proposals(id),
    CONSTRAINT fk_transaction_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Table: user_transactions
CREATE TABLE user_transactions (
    transaction_id INT,
    seller_id UUID,
    buyer_id UUID,
    PRIMARY KEY (transaction_id),
    CONSTRAINT fk_usertransaction_transaction FOREIGN KEY (transaction_id) REFERENCES transactions(id),
    CONSTRAINT fk_usertransaction_seller FOREIGN KEY (seller_id) REFERENCES users(id),
    CONSTRAINT fk_usertransaction_buyer FOREIGN KEY (buyer_id) REFERENCES users(id)
);
