import React from 'react';
import { Col, Layout, Row, Typography, Menu  } from 'antd';
import { AppstoreOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import Home from './pages/home';
import 'antd/dist/reset.css';
import './App.css';


const { Header, Content } = Layout;
const { Title } = Typography;

function App() {
  const headerStyle = { backgroundColor: '#e6e6e6' };
  const current = 'resume';
  const menuItems = [
                      {
                        label: 'Resume',
                        key: 'resume',
                        icon: <UserOutlined />,
                      },
                      {
                        label: 'Projects',
                        key: 'projects',
                        icon: <AppstoreOutlined />,
                      },
                      {
                        label: 'Contact',
                        key: 'contact',
                        icon: <MailOutlined />,
                      }
                    ]
  return (
    <div className="App">
      <Layout>
        <Header style={headerStyle}>
          <Row>
            <Col span={6}> 
              Tiisetso Tjabane
            </Col>
            <Col span={6} offset={12}>
              <Menu style={headerStyle} selectedKeys={[current]} mode="horizontal" items={menuItems} />
            </Col>
          </Row>
        </Header>
        <Content style={headerStyle}>
          <Row justify="center">
            <Col span="20">
              <Home />
            </Col>
          </Row>
        </Content>
      </Layout>
    </div>
  );
}

export default App;
