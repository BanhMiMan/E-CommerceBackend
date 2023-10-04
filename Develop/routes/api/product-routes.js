const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// GET all products with associated Category and Tag data
router.get('/', async (req, res) => {
  try {
    const allProducts = await Product.findAll({
      include: [Category, Tag]
    });
    res.status(200).json(allProducts);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET one product by ID with associated Category and Tag data
router.get('/:id', async (req, res) => {
  try {
    const oneProduct = await Product.findByPk(req.params.id, {
      include: [Category, Tag]
    });
    if (!oneProduct) {
      res.status(404).json({ message: 'Product id not found' });
      return;
    }
    res.status(200).json(oneProduct);
  } catch (err) {
    res.status(500).json(err);
  }
});

// CREATE a new product
router.post('/', async (req, res) => {
  try {
    const product = await Product.create(req.body);

    if (req.body.tagIds && req.body.tagIds.length) {
      const productTagIdArr = req.body.tagIds.map((tag_id) => ({
        product_id: product.id,
        tag_id,
      }));

      await ProductTag.bulkCreate(productTagIdArr);
    }

    res.status(201).json(product);
  } catch (err) {
    res.status(400).json(err);
  }
});

// UPDATE a product by ID
router.put('/:id', async (req, res) => {
  try {
    await Product.update(req.body, {
      where: { id: req.params.id }
    });

    if (req.body.tagIds && req.body.tagIds.length) {
      const productTagsToRemove = await ProductTag.findAll({
        where: { product_id: req.params.id }
      });

      const productTagIds = productTagsToRemove.map(({ tag_id }) => tag_id);

      const newProductTags = req.body.tagIds
        .filter((tag_id) => !productTagIds.includes(tag_id))
        .map((tag_id) => ({
          product_id: req.params.id,
          tag_id,
        }));

      await Promise.all([
        ProductTag.destroy({ where: { id: productTagsToRemove.map(({ id }) => id) } }),
        ProductTag.bulkCreate(newProductTags),
      ]);
    }

    res.status(200).json({ message: 'Product updated successfully' });
  } catch (err) {
    res.status(400).json(err);
  }
});

// DELETE a product by ID
router.delete('/:id', async (req, res) => {
  try {
    const deleteRowCount = await Product.destroy({
      where: { id: req.params.id }
    });

    if (deleteRowCount === 0) {
      res.status(404).json({ message: 'Product id not found' });
      return;
    }

    res.status(204).end(); // 204 No Content status for successful deletion
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;