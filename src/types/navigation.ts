export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  ResetPassword: { email: string };
  Onboarding: undefined;
  Home: undefined;
  Lesson: { lessonId: string };
  Profile: undefined;
  Challenges: undefined;
  StudyGuide: { unitId: string };
};
