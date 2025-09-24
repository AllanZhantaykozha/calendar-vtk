export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  category: {
    id: string;
    name: string;
  };
};
