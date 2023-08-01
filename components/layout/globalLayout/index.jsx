import { useMeasure } from "react-use";
import {
  useWindowHeight
} from '@react-hook/window-size'
import Navbar from '../components/navbar/index';
import Footer from '../components/footer/index';

const Layout = ({ children }) => {

  const [ref, { height }] = useMeasure();
  const clientHeight = useWindowHeight()
  const [footerRef, { height:footerHeight }] = useMeasure();




  return (
    <>
      <Navbar ref={ref}/>
      <main style={{paddingTop : `${height}px`, minHeight: `${clientHeight- footerHeight}px`}}>
        {children}
      </main>
      <Footer ref={footerRef}/>
    </>
)}
 
export default Layout;