import Mainroute from './routes/Mainroute';
import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { setThemePath } from './theme/themeStore';

const App = () => {
  const { pathname } = useLocation();
  useLayoutEffect(() => { setThemePath(pathname); }, [pathname]);
  return (
    <Mainroute />
  )
}

export default App
