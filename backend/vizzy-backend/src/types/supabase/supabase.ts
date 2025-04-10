export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          operationName?: string;
          query?: string;
          variables?: Json;
          extensions?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      blocked_users: {
        Row: {
          blocked_id: string;
          blocker_id: string;
        };
        Insert: {
          blocked_id: string;
          blocker_id: string;
        };
        Update: {
          blocked_id?: string;
          blocker_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_blockeduser_blocked';
            columns: ['blocked_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'fk_blockeduser_blocker';
            columns: ['blocker_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      contacts: {
        Row: {
          description: string | null;
          id: number;
          name: string;
          phone_number: string;
          user_id: string;
        };
        Insert: {
          description?: string | null;
          id?: number;
          name: string;
          phone_number: string;
          user_id: string;
        };
        Update: {
          description?: string | null;
          id?: number;
          name?: string;
          phone_number?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_contact_user';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      favorites: {
        Row: {
          listing_id: number;
          user_id: string;
        };
        Insert: {
          listing_id: number;
          user_id: string;
        };
        Update: {
          listing_id?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_favorite_listing';
            columns: ['listing_id'];
            isOneToOne: false;
            referencedRelation: 'product_listings';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'fk_favorite_user';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      giveaway_listings: {
        Row: {
          category_id: number | null;
          date_created: string | null;
          description: string | null;
          id: number;
          listing_status: number | null;
          owner_id: string | null;
          recipient_requirements: string | null;
          title: string | null;
        };
        Insert: {
          category_id?: number | null;
          date_created?: string | null;
          description?: string | null;
          id?: number;
          listing_status?: number | null;
          owner_id?: string | null;
          recipient_requirements?: string | null;
          title?: string | null;
        };
        Update: {
          category_id?: number | null;
          date_created?: string | null;
          description?: string | null;
          id?: number;
          listing_status?: number | null;
          owner_id?: string | null;
          recipient_requirements?: string | null;
          title?: string | null;
        };
        Relationships: [];
      };
      giveaway_proposals: {
        Row: {
          created_at: string;
          description: string | null;
          id: number;
          listing_id: number | null;
          message: string | null;
          proposal_status_id: number | null;
          proposal_type_id: number | null;
          receiver_id: string | null;
          sender_id: string | null;
          title: string | null;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: number;
          listing_id?: number | null;
          message?: string | null;
          proposal_status_id?: number | null;
          proposal_type_id?: number | null;
          receiver_id?: string | null;
          sender_id?: string | null;
          title?: string | null;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: number;
          listing_id?: number | null;
          message?: string | null;
          proposal_status_id?: number | null;
          proposal_type_id?: number | null;
          receiver_id?: string | null;
          sender_id?: string | null;
          title?: string | null;
        };
        Relationships: [];
      };
      listing_statuses: {
        Row: {
          description: string | null;
          id: number;
        };
        Insert: {
          description?: string | null;
          id?: number;
        };
        Update: {
          description?: string | null;
          id?: number;
        };
        Relationships: [];
      };
      listing_types: {
        Row: {
          description: string | null;
          id: number;
        };
        Insert: {
          description?: string | null;
          id?: number;
        };
        Update: {
          description?: string | null;
          id?: number;
        };
        Relationships: [];
      };
      password_reset_tokens: {
        Row: {
          created_at: string;
          expires_at: string;
          id: string;
          token: string;
          used: boolean;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          expires_at: string;
          id?: string;
          token: string;
          used?: boolean;
          user_id: string;
        };
        Update: {
          created_at?: string;
          expires_at?: string;
          id?: string;
          token?: string;
          used?: boolean;
          user_id?: string;
        };
        Relationships: [];
      };
      product_categories: {
        Row: {
          category: string;
          id: number;
        };
        Insert: {
          category: string;
          id?: number;
        };
        Update: {
          category?: string;
          id?: number;
        };
        Relationships: [];
      };
      product_conditions: {
        Row: {
          condition: string;
          id: number;
        };
        Insert: {
          condition?: string;
          id?: number;
        };
        Update: {
          condition?: string;
          id?: number;
        };
        Relationships: [];
      };
      product_images: {
        Row: {
          image_path: string;
          product_listing_id: number;
        };
        Insert: {
          image_path: string;
          product_listing_id: number;
        };
        Update: {
          image_path?: string;
          product_listing_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_productimage_listing';
            columns: ['product_listing_id'];
            isOneToOne: false;
            referencedRelation: 'product_listings';
            referencedColumns: ['id'];
          },
        ];
      };
      product_listings: {
        Row: {
          category_id: number | null;
          date_created: string | null;
          description: string | null;
          id: number;
          listing_status: number | null;
          owner_id: string | null;
          title: string | null;
        };
        Insert: {
          category_id?: number | null;
          date_created?: string | null;
          description?: string | null;
          id?: number;
          listing_status?: number | null;
          owner_id?: string | null;
          title?: string | null;
        };
        Update: {
          category_id?: number | null;
          date_created?: string | null;
          description?: string | null;
          id?: number;
          listing_status?: number | null;
          owner_id?: string | null;
          title?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_productlisting_category';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'product_categories';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'fk_productlisting_owner';
            columns: ['owner_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'fk_productlisting_status';
            columns: ['listing_status'];
            isOneToOne: false;
            referencedRelation: 'listing_statuses';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          deleted_at: string | null;
          email: string;
          id: string;
          is_deleted: boolean | null;
          location_id: number | null;
          name: string;
          username: string;
        };
        Insert: {
          deleted_at?: string | null;
          email: string;
          id?: string;
          is_deleted?: boolean | null;
          location_id?: number | null;
          name: string;
          username: string;
        };
        Update: {
          deleted_at?: string | null;
          email?: string;
          id?: string;
          is_deleted?: boolean | null;
          location_id?: number | null;
          name?: string;
          username?: string;
        };
        Relationships: [];
      };
      proposal_statuses: {
        Row: {
          description: string | null;
          id: number;
        };
        Insert: {
          description?: string | null;
          id?: number;
        };
        Update: {
          description?: string | null;
          id?: number;
        };
        Relationships: [];
      };
      proposals: {
        Row: {
          created_at: string;
          description: string | null;
          id: number;
          listing_id: number | null;
          proposal_status_id: number | null;
          proposal_type_id: number | null;
          receiver_id: string | null;
          sender_id: string | null;
          title: string | null;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: number;
          listing_id?: number | null;
          proposal_status_id?: number | null;
          proposal_type_id?: number | null;
          receiver_id?: string | null;
          sender_id?: string | null;
          title?: string | null;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: number;
          listing_id?: number | null;
          proposal_status_id?: number | null;
          proposal_type_id?: number | null;
          receiver_id?: string | null;
          sender_id?: string | null;
          title?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_proposal_listing';
            columns: ['listing_id'];
            isOneToOne: false;
            referencedRelation: 'product_listings';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'fk_proposal_receiver';
            columns: ['receiver_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'fk_proposal_sender';
            columns: ['sender_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'fk_proposal_status';
            columns: ['proposal_status_id'];
            isOneToOne: false;
            referencedRelation: 'proposal_statuses';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'fk_proposal_type';
            columns: ['proposal_type_id'];
            isOneToOne: false;
            referencedRelation: 'listing_types';
            referencedColumns: ['id'];
          },
        ];
      };
      rental_availability: {
        Row: {
          end_date: string | null;
          id: number;
          rental_listing_id: number | null;
          start_date: string | null;
        };
        Insert: {
          end_date?: string | null;
          id?: number;
          rental_listing_id?: number | null;
          start_date?: string | null;
        };
        Update: {
          end_date?: string | null;
          id?: number;
          rental_listing_id?: number | null;
          start_date?: string | null;
        };
        Relationships: [];
      };
      rental_listings: {
        Row: {
          auto_close_date: string | null;
          category_id: number | null;
          cost_per_day: number | null;
          date_created: string | null;
          deposit_required: boolean | null;
          description: string | null;
          id: number;
          late_fee: number | null;
          listing_status: number | null;
          owner_id: string | null;
          rental_duration_limit: number | null;
          title: string | null;
        };
        Insert: {
          auto_close_date?: string | null;
          category_id?: number | null;
          cost_per_day?: number | null;
          date_created?: string | null;
          deposit_required?: boolean | null;
          description?: string | null;
          id?: number;
          late_fee?: number | null;
          listing_status?: number | null;
          owner_id?: string | null;
          rental_duration_limit?: number | null;
          title?: string | null;
        };
        Update: {
          auto_close_date?: string | null;
          category_id?: number | null;
          cost_per_day?: number | null;
          date_created?: string | null;
          deposit_required?: boolean | null;
          description?: string | null;
          id?: number;
          late_fee?: number | null;
          listing_status?: number | null;
          owner_id?: string | null;
          rental_duration_limit?: number | null;
          title?: string | null;
        };
        Relationships: [];
      };
      rental_proposals: {
        Row: {
          created_at: string;
          description: string | null;
          end_date: string | null;
          id: number;
          listing_id: number | null;
          offered_rent_per_day: number | null;
          proposal_status_id: number | null;
          proposal_type_id: number | null;
          receiver_id: string | null;
          sender_id: string | null;
          start_date: string | null;
          title: string | null;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          end_date?: string | null;
          id?: number;
          listing_id?: number | null;
          offered_rent_per_day?: number | null;
          proposal_status_id?: number | null;
          proposal_type_id?: number | null;
          receiver_id?: string | null;
          sender_id?: string | null;
          start_date?: string | null;
          title?: string | null;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          end_date?: string | null;
          id?: number;
          listing_id?: number | null;
          offered_rent_per_day?: number | null;
          proposal_status_id?: number | null;
          proposal_type_id?: number | null;
          receiver_id?: string | null;
          sender_id?: string | null;
          start_date?: string | null;
          title?: string | null;
        };
        Relationships: [];
      };
      sale_listings: {
        Row: {
          category_id: number | null;
          date_created: string | null;
          description: string | null;
          id: number;
          is_negotiable: boolean | null;
          listing_status: number | null;
          owner_id: string | null;
          price: number | null;
          product_condition: number | null;
          title: string | null;
        };
        Insert: {
          category_id?: number | null;
          date_created?: string | null;
          description?: string | null;
          id?: number;
          is_negotiable?: boolean | null;
          listing_status?: number | null;
          owner_id?: string | null;
          price?: number | null;
          product_condition?: number | null;
          title?: string | null;
        };
        Update: {
          category_id?: number | null;
          date_created?: string | null;
          description?: string | null;
          id?: number;
          is_negotiable?: boolean | null;
          listing_status?: number | null;
          owner_id?: string | null;
          price?: number | null;
          product_condition?: number | null;
          title?: string | null;
        };
        Relationships: [];
      };
      sale_proposals: {
        Row: {
          created_at: string;
          description: string | null;
          id: number;
          listing_id: number | null;
          offered_price: number | null;
          proposal_status_id: number | null;
          proposal_type_id: number | null;
          receiver_id: string | null;
          sender_id: string | null;
          title: string | null;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: number;
          listing_id?: number | null;
          offered_price?: number | null;
          proposal_status_id?: number | null;
          proposal_type_id?: number | null;
          receiver_id?: string | null;
          sender_id?: string | null;
          title?: string | null;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: number;
          listing_id?: number | null;
          offered_price?: number | null;
          proposal_status_id?: number | null;
          proposal_type_id?: number | null;
          receiver_id?: string | null;
          sender_id?: string | null;
          title?: string | null;
        };
        Relationships: [];
      };
      swap_listings: {
        Row: {
          category_id: number | null;
          date_created: string | null;
          description: string | null;
          desired_item: string | null;
          id: number;
          listing_status: number | null;
          owner_id: string | null;
          title: string | null;
        };
        Insert: {
          category_id?: number | null;
          date_created?: string | null;
          description?: string | null;
          desired_item?: string | null;
          id?: number;
          listing_status?: number | null;
          owner_id?: string | null;
          title?: string | null;
        };
        Update: {
          category_id?: number | null;
          date_created?: string | null;
          description?: string | null;
          desired_item?: string | null;
          id?: number;
          listing_status?: number | null;
          owner_id?: string | null;
          title?: string | null;
        };
        Relationships: [];
      };
      swap_proposals: {
        Row: {
          created_at: string;
          description: string | null;
          id: number;
          listing_id: number | null;
          proposal_status_id: number | null;
          proposal_type_id: number | null;
          receiver_id: string | null;
          sender_id: string | null;
          swap_with: string | null;
          title: string | null;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: number;
          listing_id?: number | null;
          proposal_status_id?: number | null;
          proposal_type_id?: number | null;
          receiver_id?: string | null;
          sender_id?: string | null;
          swap_with?: string | null;
          title?: string | null;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: number;
          listing_id?: number | null;
          proposal_status_id?: number | null;
          proposal_type_id?: number | null;
          receiver_id?: string | null;
          sender_id?: string | null;
          swap_with?: string | null;
          title?: string | null;
        };
        Relationships: [];
      };
      transaction_statuses: {
        Row: {
          description: string | null;
          id: number;
        };
        Insert: {
          description?: string | null;
          id?: number;
        };
        Update: {
          description?: string | null;
          id?: number;
        };
        Relationships: [];
      };
      transactions: {
        Row: {
          buyer_id: string | null;
          date_created: string | null;
          id: number;
          listing_id: number | null;
          proposal_id: number | null;
          seller_id: string | null;
          transaction_status: number | null;
        };
        Insert: {
          buyer_id?: string | null;
          date_created?: string | null;
          id?: number;
          listing_id?: number | null;
          proposal_id?: number | null;
          seller_id?: string | null;
          transaction_status?: number | null;
        };
        Update: {
          buyer_id?: string | null;
          date_created?: string | null;
          id?: number;
          listing_id?: number | null;
          proposal_id?: number | null;
          seller_id?: string | null;
          transaction_status?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_transaction_listing';
            columns: ['listing_id'];
            isOneToOne: false;
            referencedRelation: 'product_listings';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'fk_transaction_proposal';
            columns: ['proposal_id'];
            isOneToOne: false;
            referencedRelation: 'proposals';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'fk_transaction_status';
            columns: ['transaction_status'];
            isOneToOne: false;
            referencedRelation: 'transaction_statuses';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transactions_buyer_id_fkey';
            columns: ['buyer_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transactions_seller_id_fkey';
            columns: ['seller_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      full_product_listings: {
        Row: {
          auto_close_date: string | null;
          category_id: number | null;
          cost_per_day: number | null;
          date_created: string | null;
          deposit_required: boolean | null;
          description: string | null;
          desired_item: string | null;
          id: number | null;
          is_negotiable: boolean | null;
          late_fee: number | null;
          listing_status: number | null;
          listing_type: string | null;
          owner_id: string | null;
          price: number | null;
          product_condition: number | null;
          recipient_requirements: string | null;
          rental_duration_limit: number | null;
          title: string | null;
        };
        Relationships: [];
      };
      full_proposals: {
        Row: {
          created_at: string | null;
          description: string | null;
          end_date: string | null;
          id: number | null;
          listing_id: number | null;
          listing_title: string | null;
          message: string | null;
          offered_price: number | null;
          offered_rent_per_day: number | null;
          proposal_status: string | null;
          proposal_status_id: number | null;
          proposal_type: string | null;
          proposal_type_id: number | null;
          receiver_id: string | null;
          receiver_name: string | null;
          sender_id: string | null;
          sender_name: string | null;
          start_date: string | null;
          swap_with: string | null;
          title: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      calculate_user_balance: {
        Args: { _owner_id: string };
        Returns: number;
      };
      create_location_and_update_profile: {
        Args: {
          p_user_id: string;
          p_address: string;
          p_latitude: number;
          p_longitude: number;
        };
        Returns: undefined;
      };
      create_proposal: {
        Args: {
          _listing_id: number;
          _current_user_id: string;
          _proposal_type: string;
          _proposal_status: string;
          _title: string;
          _description: string;
          _offered_rent_per_day?: number;
          _start_date?: string;
          _end_date?: string;
          _offered_price?: number;
          _swap_with?: string;
          _message?: string;
          _target_username?: string;
        };
        Returns: {
          proposal_id: number;
          proposal_title: string;
          proposal_description: string;
        }[];
      };
      create_user: {
        Args: {
          p_user_id: string;
          p_user_name: string;
          p_email: string;
          p_name: string;
          p_location_id?: number;
          p_is_deleted?: boolean;
          p_deleted_at?: string;
        };
        Returns: undefined;
      };
      fetch_home_listings: {
        Args:
          | {
              _limit: number;
              _offset: number;
              _listing_type?: string;
              _search?: string;
            }
          | {
              _limit: number;
              _offset: number;
              _listing_type?: string;
              _search?: string;
              _lat?: number;
              _lon?: number;
              _dist?: number;
            };
        Returns: {
          id: string;
          title: string;
          type: string;
          price: string;
          priceperday: string;
          imageurl: string;
          total_pages: number;
        }[];
      };
      fetch_listings: {
        Args: { _owner_id: string; _limit: number; _offset: number };
        Returns: {
          id: string;
          title: string;
          type: string;
          price: string;
          priceperday: string;
          imageurl: string;
        }[];
      };
      fetch_proposal_by_id: {
        Args: { p_proposal_id: number };
        Returns: {
          proposal_id: number;
          title: string;
          description: string;
          sender_id: string;
          sender_name: string;
          receiver_id: string;
          receiver_name: string;
          listing_id: number;
          listing_title: string;
          proposal_type_id: number;
          proposal_type: string;
          proposal_status_id: number;
          status: string;
          created_at: string;
        }[];
      };
      fetch_received_basic_proposals_by_user: {
        Args: { p_user_id: string; p_limit: number; p_page: number };
        Returns: {
          proposal_id: number;
          title: string;
          description: string;
          sender_id: string;
          receiver_id: string;
          sender_name: string;
          listing_id: number;
          listing_title: string;
          proposal_type: string;
          status: string;
          created_at: string;
        }[];
      };
      fetch_sent_basic_proposals_by_user: {
        Args: { p_user_id: string; p_limit: number; p_page: number };
        Returns: {
          proposal_id: number;
          title: string;
          description: string;
          sender_id: string;
          receiver_id: string;
          sender_name: string;
          listing_id: number;
          listing_title: string;
          proposal_type: string;
          status: string;
          created_at: string;
        }[];
      };
      fetch_user_location: {
        Args: { _user_id: string };
        Returns: {
          location_id: number;
          full_address: string;
          lat: number;
          lon: number;
          created_at: string;
        }[];
      };
      get_basic_user_info: {
        Args: { user_uuid: string };
        Returns: {
          id: string;
          username: string;
          name: string;
          location_id: number;
          is_deleted: boolean;
          deleted_at: string;
          created_at: string;
          last_signed_in: string;
        }[];
      };
      get_listing_json: {
        Args: { listing_id: number };
        Returns: Json;
      };
      get_proposal_json: {
        Args: { proposal_id: number };
        Returns: Json;
      };
      get_user_profile: {
        Args: { username: string };
        Returns: Json;
      };
      get_user_proposals: {
        Args: { p_user_id: string; p_limit?: number; p_offset?: number };
        Returns: {
          proposal_id: number;
          title: string;
          description: string;
          sender_id: string;
          receiver_id: string;
          listing_id: number;
          proposal_type: string;
          proposal_status: string;
          swap_with: string;
          offered_price: number;
          message: string;
          offered_rent_per_day: number;
          start_date: string;
          end_date: string;
          created_at: string;
        }[];
      };
      insert_contact: {
        Args: {
          _user_id: string;
          _name: string;
          _description: string;
          _phone_number: string;
        };
        Returns: {
          id: number;
          name: string;
          phone_number: string;
          description: string;
        }[];
      };
      soft_delete_user: {
        Args: { _user_id: string };
        Returns: undefined;
      };
      update_auth_metadata: {
        Args: { new_metadata: Json; user_id: string };
        Returns: undefined;
      };
      update_proposal_status: {
        Args: { p_proposal_id: number; p_new_status: string };
        Returns: undefined;
      };
      update_user_data: {
        Args: { user_id_text: string; profile_data: Json };
        Returns: undefined;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
