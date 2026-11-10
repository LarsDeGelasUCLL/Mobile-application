export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Table<Row, Insert, Update = Partial<Insert>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      user_profiles: Table<
        {
          id: string;
          email_address: string;
          display_name: string;
          phone_number: string | null;
          iban: string | null;
          profile_picture_url: string | null;
          custom_bio: string | null;
          record_created: string;
        },
        {
          id: string;
          email_address: string;
          display_name: string;
          phone_number?: string | null;
          iban?: string | null;
          profile_picture_url?: string | null;
          custom_bio?: string | null;
          record_created?: string;
        }
      >;
      user_settings: Table<
        {
          user_id: string;
          push_notification_token: string | null;
          ui_theme: string;
          language_code: string;
          notify_new_expense: boolean;
          notify_reminders: boolean;
          notify_group_updates: boolean;
        },
        {
          user_id: string;
          push_notification_token?: string | null;
          ui_theme?: string;
          language_code?: string;
          notify_new_expense?: boolean;
          notify_reminders?: boolean;
          notify_group_updates?: boolean;
        }
      >;
      groups: Table<
        {
          id: string;
          name: string;
          description: string | null;
          invite_code: string;
          group_icon_url: string | null;
          created_by: string | null;
          record_created: string;
        },
        {
          id?: string;
          name: string;
          description?: string | null;
          invite_code?: string;
          group_icon_url?: string | null;
          created_by?: string | null;
          record_created?: string;
        }
      >;
      memberships: Table<
        {
          id: string;
          user_id: string;
          group_id: string;
          group_role: string;
          status: string;
          invited_by: string | null;
          joined_at: string;
        },
        {
          id?: string;
          user_id: string;
          group_id: string;
          group_role?: string;
          status?: string;
          invited_by?: string | null;
          joined_at?: string;
        }
      >;
      expenses: Table<
        {
          id: string;
          group_id: string | null;
          paid_by_user_id: string;
          title: string;
          amount: number;
          receipt_url: string | null;
          record_created: string;
        },
        {
          id?: string;
          group_id?: string | null;
          paid_by_user_id: string;
          title: string;
          amount: number;
          receipt_url?: string | null;
          record_created?: string;
        }
      >;
      expense_splits: Table<
        {
          id: string;
          expense_id: string;
          user_id: string;
          amount_owed: number;
          is_settled: boolean;
        },
        {
          id?: string;
          expense_id: string;
          user_id: string;
          amount_owed: number;
          is_settled?: boolean;
        }
      >;
    };
    Views: Record<string, never>;
    Functions: {
      get_my_user_profile: {
        Args: Record<PropertyKey, never>;
        Returns: Database["public"]["Tables"]["user_profiles"]["Row"];
      };
      update_my_user_profile: {
        Args: { _payload: Json };
        Returns: Database["public"]["Tables"]["user_profiles"]["Row"];
      };
      invite_user_by_email: {
        Args: { _group_id: string; _target_email: string };
        Returns: Database["public"]["Tables"]["memberships"]["Row"];
      };
      create_group_with_membership: {
        Args: {
          _name: string;
          _description: string | null;
          _group_icon_url: string | null;
        };
        Returns: Database["public"]["Tables"]["groups"]["Row"];
      };
      join_group_by_invite_code: {
        Args: { _invite_code: string };
        Returns: Database["public"]["Tables"]["groups"]["Row"];
      };
      create_expense_with_splits: {
        Args: {
          _group_id: string | null;
          _title: string;
          _amount: number;
          _receipt_url: string | null;
          _splits: Json;
        };
        Returns: Database["public"]["Tables"]["expenses"]["Row"];
      };
      update_expense_with_splits: {
        Args: {
          _expense_id: string;
          _title: string;
          _amount: number;
          _receipt_url: string | null;
          _splits: Json;
        };
        Returns: Database["public"]["Tables"]["expenses"]["Row"];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
