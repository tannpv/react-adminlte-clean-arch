import React, { useState } from 'react';
import Button from '../../../shared/components/ui/Button';
import Card from '../../../shared/components/ui/Card';
import Form from '../../../shared/components/ui/Form';
import Modal from '../../../shared/components/ui/Modal';
import Table from '../../../shared/components/ui/Table';
import { useLanguage } from '../../../shared/hooks/useLanguage';
import { useTranslation } from '../../../shared/hooks/useTranslation';

const TailwindDemoPage = () => {
    const { languageCode } = useLanguage();
    const { t } = useTranslation(languageCode, 'common');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: '',
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
        setShowModal(false);
        setFormData({ name: '', email: '', role: '' });
    };

    const sampleData = [
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active' },
        { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Editor', status: 'Inactive' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Tailwind CSS Demo Page
                    </h1>
                    <p className="text-gray-600">
                        Testing the new Tailwind CSS components and layout system
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-white bg-opacity-20">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-blue-100 text-sm font-medium">Total Users</p>
                                <p className="text-2xl font-bold">1,234</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-white bg-opacity-20">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-green-100 text-sm font-medium">Categories</p>
                                <p className="text-2xl font-bold">56</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-white bg-opacity-20">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5zM8 15V9h4v6H8z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-purple-100 text-sm font-medium">Products</p>
                                <p className="text-2xl font-bold">892</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-white bg-opacity-20">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-orange-100 text-sm font-medium">Orders</p>
                                <p className="text-2xl font-bold">2,456</p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Action Buttons */}
                <div className="mb-8">
                    <Card>
                        <Card.Header>
                            <h3 className="text-lg font-semibold text-gray-900">Action Buttons Demo</h3>
                        </Card.Header>
                        <Card.Body>
                            <div className="flex flex-wrap gap-4">
                                <Button variant="primary">Primary Button</Button>
                                <Button variant="secondary">Secondary Button</Button>
                                <Button variant="success">Success Button</Button>
                                <Button variant="danger">Danger Button</Button>
                                <Button variant="warning">Warning Button</Button>
                                <Button variant="info">Info Button</Button>
                                <Button variant="light">Light Button</Button>
                                <Button variant="dark">Dark Button</Button>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-4">
                                <Button variant="primary" outline>Primary Outline</Button>
                                <Button variant="secondary" outline>Secondary Outline</Button>
                                <Button variant="success" outline>Success Outline</Button>
                                <Button variant="danger" outline>Danger Outline</Button>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-4">
                                <Button variant="primary" size="sm">Small</Button>
                                <Button variant="primary" size="md">Medium</Button>
                                <Button variant="primary" size="lg">Large</Button>
                            </div>
                        </Card.Body>
                    </Card>
                </div>

                {/* Table Demo */}
                <div className="mb-8">
                    <Card>
                        <Card.Header>
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-900">Sample Data Table</h3>
                                <Button variant="primary" onClick={() => setShowModal(true)}>
                                    Add New User
                                </Button>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            <Table hover darkHeader>
                                <Table.Header>
                                    <Table.HeaderCell>ID</Table.HeaderCell>
                                    <Table.HeaderCell>Name</Table.HeaderCell>
                                    <Table.HeaderCell>Email</Table.HeaderCell>
                                    <Table.HeaderCell>Role</Table.HeaderCell>
                                    <Table.HeaderCell>Status</Table.HeaderCell>
                                    <Table.HeaderCell>Actions</Table.HeaderCell>
                                </Table.Header>
                                <Table.Body>
                                    {sampleData.map((user) => (
                                        <Table.Row key={user.id}>
                                            <Table.Cell className="font-medium text-gray-900">{user.id}</Table.Cell>
                                            <Table.Cell>{user.name}</Table.Cell>
                                            <Table.Cell>{user.email}</Table.Cell>
                                            <Table.Cell>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {user.role}
                                                </span>
                                            </Table.Cell>
                                            <Table.Cell>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.status === 'Active'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {user.status}
                                                </span>
                                            </Table.Cell>
                                            <Table.Cell>
                                                <div className="flex space-x-2">
                                                    <Button variant="primary" size="sm">Edit</Button>
                                                    <Button variant="danger" size="sm">Delete</Button>
                                                </div>
                                            </Table.Cell>
                                        </Table.Row>
                                    ))}
                                </Table.Body>
                            </Table>
                        </Card.Body>
                    </Card>
                </div>

                {/* Form Demo */}
                <div className="mb-8">
                    <Card>
                        <Card.Header>
                            <h3 className="text-lg font-semibold text-gray-900">Form Components Demo</h3>
                        </Card.Header>
                        <Card.Body>
                            <form className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Form.Group>
                                        <Form.Label htmlFor="demo-name">Full Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            id="demo-name"
                                            placeholder="Enter your full name"
                                        />
                                        <Form.HelpText>This is a help text for the name field</Form.HelpText>
                                    </Form.Group>

                                    <Form.Group>
                                        <Form.Label htmlFor="demo-email">Email Address</Form.Label>
                                        <Form.Control
                                            type="email"
                                            id="demo-email"
                                            placeholder="Enter your email"
                                        />
                                    </Form.Group>

                                    <Form.Group>
                                        <Form.Label htmlFor="demo-role">Role</Form.Label>
                                        <Form.Select id="demo-role">
                                            <option value="">Select a role</option>
                                            <option value="admin">Administrator</option>
                                            <option value="user">User</option>
                                            <option value="editor">Editor</option>
                                        </Form.Select>
                                    </Form.Group>

                                    <Form.Group>
                                        <Form.Label htmlFor="demo-status">Status</Form.Label>
                                        <Form.Select id="demo-status">
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                            <option value="pending">Pending</option>
                                        </Form.Select>
                                    </Form.Group>
                                </div>

                                <Form.Group>
                                    <Form.Label htmlFor="demo-description">Description</Form.Label>
                                    <Form.Textarea
                                        id="demo-description"
                                        rows={4}
                                        placeholder="Enter a description"
                                    />
                                </Form.Group>

                                <div className="flex justify-end space-x-4">
                                    <Button variant="secondary" type="button">Cancel</Button>
                                    <Button variant="primary" type="submit">Save Changes</Button>
                                </div>
                            </form>
                        </Card.Body>
                    </Card>
                </div>

                {/* Modal Demo */}
                <Modal show={showModal} onClose={() => setShowModal(false)}>
                    <Modal.Header onClose={() => setShowModal(false)}>
                        Add New User
                    </Modal.Header>
                    <Modal.Body>
                        <form onSubmit={handleSubmit}>
                            <Form.Group>
                                <Form.Label htmlFor="modal-name">Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    id="modal-name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter user name"
                                    required
                                />
                            </Form.Group>

                            <Form.Group>
                                <Form.Label htmlFor="modal-email">Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    id="modal-email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="Enter user email"
                                    required
                                />
                            </Form.Group>

                            <Form.Group>
                                <Form.Label htmlFor="modal-role">Role</Form.Label>
                                <Form.Select
                                    id="modal-role"
                                    name="role"
                                    value={formData.role}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select a role</option>
                                    <option value="admin">Administrator</option>
                                    <option value="user">User</option>
                                    <option value="editor">Editor</option>
                                </Form.Select>
                            </Form.Group>
                        </form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={handleSubmit}>
                            Add User
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        </div>
    );
};

export default TailwindDemoPage;
