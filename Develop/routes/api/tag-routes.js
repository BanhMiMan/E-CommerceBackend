const router = require('express').Router();
const { Tag, Product } = require('../../models');

// GET all tags with associated Products
router.get('/', async (req, res) => {
  try {
    const allTags = await Tag.findAll({ include: Product });
    res.status(200).json(allTags);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET a single tag by ID with associated Product
router.get('/:id', async (req, res) => {
  try {
    const oneTag = await Tag.findByPk(req.params.id, { include: Product });
    if (!oneTag) {
      return res.status(404).json({ message: 'Tag id not found' });
    }
    res.status(200).json(oneTag);
  } catch (err) {
    res.status(500).json(err);
  }
});

// CREATE a new tag
router.post('/', async (req, res) => {
  try {
    const createTag = await Tag.create(req.body);
    res.status(201).json(createTag);
  } catch (err) {
    res.status(400).json(err);
  }
});

// UPDATE a tag's name by its ID
router.put('/:id', async (req, res) => {
  try {
    const [updatedCount] = await Tag.update(req.body, {
      where: { id: req.params.id },
    });
    if (updatedCount === 0) {
      return res.status(404).json({ message: 'Tag id not found' });
    }
    res.status(200).json({ message: 'Tag updated successfully' });
  } catch (err) {
    res.status(500).json(err);
  }
});

// DELETE a tag by its ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedRowCount = await Tag.destroy({ where: { id: req.params.id } });
    if (deletedRowCount === 0) {
      return res.status(404).json({ message: 'Tag id not found' });
    }
    res.status(204).end(); // 204 No Content status for successful deletion
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;