import React, { useContext } from 'react'
import { Navbar as BSNavbar, Nav, Container, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext.jsx'

const Navbar = () => {
  const { user, logout } = useContext(AuthContext)

  return (
    <BSNavbar expand="lg" className="app-navbar" variant="dark">
      <Container>
        <BSNavbar.Brand as={Link} to="/">Food Donation</BSNavbar.Brand>
        <BSNavbar.Toggle aria-controls="main-nav" />
        <BSNavbar.Collapse id="main-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            {user && (
              <>
                <Nav.Link as={Link} to="/dashboard">Discover</Nav.Link>
                <Nav.Link as={Link} to="/create-donation">Create</Nav.Link>
                <Nav.Link as={Link} to="/my-donations">My Donations</Nav.Link>
                <Nav.Link as={Link} to="/requests">Requests</Nav.Link>
                <Nav.Link as={Link} to="/ai-tools">AI Tools</Nav.Link>
                {user.role === 'ADMIN' && <Nav.Link as={Link} to="/admin">Admin</Nav.Link>}
                {user.role === 'VOLUNTEER' && <Nav.Link as={Link} to="/volunteer">Volunteer</Nav.Link>}
              </>
            )}
          </Nav>
          <Nav>
            {user ? (
              <>
                <span className="text-white me-2">{user.name || user.email}</span>
                <Button variant="outline-light" size="sm" onClick={logout}>Logout</Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <Nav.Link as={Link} to="/register">Register</Nav.Link>
              </>
            )}
          </Nav>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  )
}

export default Navbar
