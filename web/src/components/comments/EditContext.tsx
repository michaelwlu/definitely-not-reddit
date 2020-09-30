import { createContext, Dispatch, SetStateAction } from 'react';

interface EditContextInterface {
  sectionEdit: number | null;
  setSectionEdit: Dispatch<SetStateAction<number | null>>;
}

const EditContext = createContext<EditContextInterface>({
  sectionEdit: null,
  setSectionEdit: () => {},
});

export default EditContext;
