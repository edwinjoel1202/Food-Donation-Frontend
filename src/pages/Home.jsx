import React from 'react'
import { Container, Row, Col, Card, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'

const Home = () => {
  return (
    <Container>
      <Row className="g-4">
        <Col md={8}>
          <Card className="p-4">
            <h2>Welcome to Food Donation</h2>
            <p>Donate excess food, reduce waste and help communities.</p>
            <Button as={Link} to="/dashboard" variant="success">Discover Donations</Button>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="p-3">
            <h5>How it works</h5>
            <ol>
              <li>Create donation (describe food)</li>
              <li>Recipients request items</li>
              <li>Volunteer or donor coordinate pickup</li>
            </ol>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default Home
