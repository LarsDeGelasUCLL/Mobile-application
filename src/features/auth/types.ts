/** The values that carry over when the user switches login mode. */
export interface AuthFields {
  email: string;
  password: string;
  displayName: string;
  phoneNumber: string;
}

/** What each login form gets for its carried-over values. */
export interface AuthFieldProps {
  fields: AuthFields;
  onChangeField: (field: keyof AuthFields, value: string) => void;
}
