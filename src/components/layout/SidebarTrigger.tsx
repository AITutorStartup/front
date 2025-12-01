import { useSidebar } from '@/context/SidebarContext'; 
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import styles from './SidebarTrigger.module.css';

const SidebarTrigger = () => {
  const { isOpen, toggle } = useSidebar();

  return (
    <button onClick={toggle} className={styles.triggerButton}>
      {isOpen ? <PanelLeftClose /> : <PanelLeftOpen />}
    </button>
  );
};

export default SidebarTrigger;
