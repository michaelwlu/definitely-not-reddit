import * as Yup from 'yup';

const minError = (val: number) => `Minimum character limit of ${val}`;
const maxError = (val: number) => `Maximum character limit of ${val}`;

export const postValidation = Yup.object({
  title: Yup.string().required('Required').max(120, maxError(120)),
  text: Yup.string().optional(),
});

export const commentValidation = Yup.object({
  text: Yup.string().required('Required').max(10000, maxError(10000)),
});

export const userValidation = Yup.object({
  username: Yup.string()
    .required('Required')
    .min(1, minError(1))
    .max(36, maxError(36)),
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string()
    .required('Required')
    .min(6, minError(6))
    .max(256, maxError(256)),
});
