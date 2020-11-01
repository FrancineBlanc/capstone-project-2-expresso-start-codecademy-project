const express = require('express');
const menusRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const menuItemsRouter = require('./menuItem');

menusRouter.use('/:menuId/menu-items', menuItemsRouter);

menusRouter.param('menuId', (req, res, next, menuId) => {
    const sql = 'SELECT * FROM Menu WHERE Menu.id = $menuId';
    const values = { $menuId: menuId };

    db.get(sql, values, (error, menu) => {
        if (error) {
            next (error);
        } else if (menu) {
            req.menu = menu;
            next();
        } else {
            res.sendStatus(404);
        }
    });
});

menusRouter.get('/', (req, res, next) => {
    const sql = 'SELECT * FROM Menu';

    db.all(sql, (error, menus) => {
        if(error) {
            next(error);
        } else {
            res.status(200).send({ menus: menus });
        }
    });
});

menusRouter.get('/:menuId', (req, res, next) => {
    res.status(200).json({ menu: req.menu });
});

menusRouter.post('/', (req, res, next) => {
    const title = req.body.menu.title;

    if (!title) {
        return res.status(400).send();
    }

    const sql = 'INSERT INTO Menu(title) VALUES ($title)';
    const values = { $title: title };

    db.run(sql, values, function(error) {
        if(error) {
            next (error);
        } else {
            db.get('SELECT * FROM Menu WHERE Menu.id = $menuId', {
                $menuId: this.lastID
            }, 
            (error, menu) => {
                res.status(201).json({ menu: menu });
            });
        }
    });    
});

menusRouter.put('/:menuId', (req, res, next) => {
    const title = req.body.menu.title;

    if(!title) {
        return res.sendStatus(400);
    }

    const sql = 'UPDATE Menu SET title = $title WHERE Menu.id = $menuId';
    const values = { $title: title, $menuId: req.params.menuId };

    db.run(sql, values, (error) => {
        if (error) {
            next(error);
        } else {
            db.get(`SELECT * FROM Menu WHERE Menu.id = ${req.params.menuId}`, 
            (error, menu) => {
                res.status(200).json({ menu: menu });
            });
        }
    });
});

menusRouter.delete('/:menuId', (req, res, next) => {
    db.get('SELECT * FROM MenuItem WHERE MenuItem.menu_id = $menuId', 
    {
        $menuId: req.params.menuId
    }, 
    (error, menuItems) => {
        if (error) {
            next (error); 
        } else if (menuItems) {
            res.sendStatus(400);
        } else {
            db.run('DELETE FROM Menu WHERE Menu.id = $menuId', 
            {
                $menuId: req.params.menuId
            },
            (error) => {
                if (error) {
                    next(error);
                } else {
                    res.sendStatus(204);
                }
            })
        }
    })
});

module.exports = menusRouter;

// seriesRouter.delete('/:seriesId', (req, res, next) => {
//     db.get('SELECT * FROM Issue WHERE Issue.series_id = $seriesId', 
//         {
//             $seriesId: req.params.seriesId
//         },
//         (error, issue) => {
//             if (error) {
//                 next(error);
//             } else if (issue) {
//                 res.sendStatus(400);
//             } else {
//                 db.run('DELETE FROM Series WHERE Series.id = $seriesId',
//                 {
//                     $seriesId: req.params.seriesId
//                 }, 
//                 (error) => {
//                     if (error) {
//                         next (error);
//                     } else {
//                         res.sendStatus(204);
//                     }
//                 });  
//             }              
//         }
//     )
// });