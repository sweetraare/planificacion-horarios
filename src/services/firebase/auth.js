import {auth} from "./config";

export const CreateUser = async (email, password) => {
  try {
    const response = await auth.createUserWithEmailAndPassword(email, password);
    return response.user;
  } catch (error) {
    return error;
  }
};

export const SignInAdmin = (email, password) => {
  return auth.signInWithEmailAndPassword(email, password);
};

export const ResetPassword = email => {
  return auth.sendPasswordResetEmail(email);
};

export const SignOut = () => {
  return auth.signOut();
};

export const verifyResetCode = code => {
  return auth.verifyPasswordResetCode(code);
};

export const verifyConfirmEmailCode = code => {
  return auth.applyActionCode(code);
};

export const changePassword = (code, newPassword) => {
  return auth.confirmPasswordReset(code, newPassword);
};
