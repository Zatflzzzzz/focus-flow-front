import {Category} from '../models/enums/category.enum';
import {Priority} from '../models/enums/priority.enum';
import {Layouts} from '../models/enums/layouts.enum';

export const CategoryMap: Record<Category, string> = {
  WORK: 'Работа',
  PERSONAL: 'Личное',
  STUDY: 'Учёба',
  HEALTH: 'Здоровье'
};

export const PriorityMap: Record<Priority, string> = {
  LOW: 'Низкий',
  MEDIUM: 'Средний',
  HIGH: 'Высокий',
  CRITICAL: 'Критический'
};

export const LayoutMap: Record<Layouts, string> = {
  TABLE: 'Таблица',
  BOARD: 'Доска',
  ROADMAP: 'Дорожная карта'
};
