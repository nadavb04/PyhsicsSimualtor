import { createHashRouter } from 'react-router';
import { AppShell } from './ui/layout/AppShell';
import { NotFound } from './ui/screens/NotFound';
import { QuestionScreen } from './ui/screens/QuestionScreen';
import { TopicList } from './ui/screens/TopicList';
import { TopicScreen } from './ui/screens/TopicScreen';

/** Hash routing: deep links work on static hosting (GitHub Pages) without server rewrites. */
export const routes = [
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <TopicList /> },
      { path: 'topic/:topicId', element: <TopicScreen /> },
      { path: 'topic/:topicId/:questionId', element: <QuestionScreen /> },
      { path: '*', element: <NotFound /> },
    ],
  },
];

export const router = createHashRouter(routes);
