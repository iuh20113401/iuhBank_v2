import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { useState, useEffect } from 'react';
import iuh from "../iuh.png"


export default function Header() {
    const [isTop, setIsTop] = useState(true);

    useEffect(() => {
        document.addEventListener('scroll', () => {
        const scrollCheck = window.scrollY < 10;
        if (scrollCheck !== isTop) {
            setIsTop(scrollCheck);
        }
        });
    });
        return(
            <>
                <Navbar bg="light" expand="lg"  sticky="top"> 
                    <Container fluid className='row'>
                        <Navbar.Brand href="/" className='w-25'>
                            <img
                            alt=""
                            src= {iuh}
                            width="30"
                            height="30"
                            className="d-inline-block align-top"
                            />{' '}
                            IuhBank
                        </Navbar.Brand>
                        <Navbar.Toggle aria-controls="navbarScroll" />
                        <Navbar.Collapse id="navbarScroll">
                            <Nav
                                className="me-auto my-2 my-lg-0 w-75 text-center row  "
                                style={{ maxHeight: '100px',justifyContent: 'center'}}
                                navbarScroll
                            >
                                <Nav.Link href="#action1" className='col-3'>Trang chủ</Nav.Link>
                                <p className='col-1'></p>
                                <Nav.Link href="#action2" className='col-3'>Developer</Nav.Link>
                                <Nav.Link href="#" className='col-3'>
                                FAQ
                                </Nav.Link>
                            </Nav>
                            <Form className="d-flex justify-content-end  w-100">
                                <a href="/home"><Button variant="btn btn-primary">Launch App</Button></a>
                            </Form>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>   
            </>
        )
}