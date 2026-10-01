// يُستورد أولاً في main.tsx: تُستعاد البيانات من القرص قبل تقييم أي وحدة أخرى تقرأ التخزين.
import { initDesktopPersistence } from './desktopPersistence';

initDesktopPersistence();
