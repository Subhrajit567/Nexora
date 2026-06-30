import { useContext } from "react";
import { NexoraContext } from "../../provider/Provider";

const useNexora = () => {
  return useContext(NexoraContext);
};

export default useNexora;